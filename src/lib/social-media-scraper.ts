import { RateLimiter } from './rate-limiter';
import type { SocialMediaProfiles, TwitterProfile } from '@/types';

interface SocialMediaSearchResult {
  twitter?: TwitterProfile;
  github?: string;
  website?: string;
}

export class SocialMediaScraper {
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter({
      maxRequests: 10,
      windowMs: 60 * 1000,
    });
  }

  /**
   * Search for social media profiles using SerpAPI
   * This searches Google for Twitter/X profiles associated with a person
   */
  async findSocialProfiles(
    name: string,
    company?: string
  ): Promise<SocialMediaProfiles> {
    const profiles: SocialMediaProfiles = {};

    const serpApiKey = process.env.SERPAPI_API_KEY;
    if (!serpApiKey || serpApiKey === 'your_serpapi_api_key_here') {
      console.warn('[SocialMedia] SerpAPI not configured, skipping social media lookup');
      return profiles;
    }

    await this.rateLimiter.waitForAvailability();

    try {
      // Search for Twitter/X profile
      const twitterProfile = await this.searchTwitterProfile(name, company, serpApiKey);
      if (twitterProfile) {
        profiles.twitter = twitterProfile;
      }

      // Search for GitHub profile
      const githubUrl = await this.searchGitHubProfile(name, company, serpApiKey);
      if (githubUrl) {
        profiles.github = githubUrl;
      }

      this.rateLimiter.recordRequest();
    } catch (error) {
      console.error(`[SocialMedia] Error finding profiles for ${name}:`, error);
    }

    return profiles;
  }

  private async searchTwitterProfile(
    name: string,
    company?: string,
    apiKey?: string
  ): Promise<TwitterProfile | undefined> {
    if (!apiKey) return undefined;

    const query = company 
      ? `${name} ${company} site:twitter.com OR site:x.com`
      : `${name} site:twitter.com OR site:x.com`;

    try {
      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.append('q', query);
      url.searchParams.append('api_key', apiKey);
      url.searchParams.append('num', '3');

      const response = await fetch(url.toString());
      if (!response.ok) {
        console.warn(`[SocialMedia] SerpAPI Twitter search failed: ${response.statusText}`);
        return undefined;
      }

      const data = await response.json();
      const results = data.organic_results || [];

      // Find the most relevant Twitter/X result
      for (const result of results) {
        const link = result.link || '';
        if (link.includes('twitter.com/') || link.includes('x.com/')) {
          // Extract handle from URL
          const handleMatch = link.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/);
          if (handleMatch && handleMatch[1] && !['search', 'hashtag', 'i'].includes(handleMatch[1])) {
            const handle = handleMatch[1];
            
            // Try to get more details about the profile
            const profileData = await this.fetchTwitterProfileDetails(handle, apiKey);
            
            return {
              handle: `@${handle}`,
              bio: profileData?.bio || result.snippet,
              recentTweets: profileData?.recentTweets || [],
              followers: profileData?.followers,
            };
          }
        }
      }
    } catch (error) {
      console.error('[SocialMedia] Twitter search error:', error);
    }

    return undefined;
  }

  private async fetchTwitterProfileDetails(
    handle: string,
    apiKey: string
  ): Promise<{ bio?: string; recentTweets?: string[]; followers?: number } | undefined> {
    try {
      // Use SerpAPI's Twitter profile search to get recent tweets
      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.append('q', `from:${handle}`);
      url.searchParams.append('api_key', apiKey);
      url.searchParams.append('engine', 'twitter');
      url.searchParams.append('num', '5');

      const response = await fetch(url.toString());
      if (!response.ok) return undefined;

      const data = await response.json();
      
      // Extract recent tweets from the results
      const tweets = data.tweets || data.organic_results || [];
      const recentTweets = tweets
        .slice(0, 5)
        .map((t: any) => t.snippet || t.text || t.content)
        .filter(Boolean);

      return {
        bio: data.profile?.bio || data.profile?.description,
        recentTweets,
        followers: data.profile?.followers_count,
      };
    } catch (error) {
      console.error('[SocialMedia] Twitter profile fetch error:', error);
      return undefined;
    }
  }

  private async searchGitHubProfile(
    name: string,
    company?: string,
    apiKey?: string
  ): Promise<string | undefined> {
    if (!apiKey) return undefined;

    const query = company 
      ? `${name} ${company} site:github.com`
      : `${name} developer site:github.com`;

    try {
      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.append('q', query);
      url.searchParams.append('api_key', apiKey);
      url.searchParams.append('num', '3');

      const response = await fetch(url.toString());
      if (!response.ok) return undefined;

      const data = await response.json();
      const results = data.organic_results || [];

      // Find the most relevant GitHub profile result
      for (const result of results) {
        const link = result.link || '';
        // Match github.com/username but not github.com/username/repo
        if (link.match(/github\.com\/[^\/]+\/?$/)) {
          return link;
        }
      }
    } catch (error) {
      console.error('[SocialMedia] GitHub search error:', error);
    }

    return undefined;
  }

  /**
   * Fetch social profiles for multiple people in batch
   */
  async fetchSocialProfilesBatch(
    people: Array<{ name: string; company?: string }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<Map<string, SocialMediaProfiles>> {
    const results = new Map<string, SocialMediaProfiles>();
    let completed = 0;

    for (const person of people) {
      const profiles = await this.findSocialProfiles(person.name, person.company);
      results.set(person.name, profiles);
      completed++;
      onProgress?.(completed, people.length);
      
      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }
}
