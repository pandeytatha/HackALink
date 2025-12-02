import { RateLimiter } from './rate-limiter';
import type { LinkedInProfile } from '@/types';

type ScraperProvider = 'proxycurl' | 'scraperai' | 'scraperapi' | 'manual';

interface ScraperResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class LinkedInScraper {
  private rateLimiter: RateLimiter;
  private provider: ScraperProvider;
  private apiKey: string;
  private baseUrl: string;

  constructor(provider: ScraperProvider = 'manual') {
    this.provider = provider;
    
    // Set API key and base URL based on provider
    switch (provider) {
      case 'proxycurl':
        this.apiKey = process.env.PROXYCURL_API_KEY || '';
        this.baseUrl = 'https://nubela.co/proxycurl/api/v2/linkedin';
        break;
      case 'scraperai':
        this.apiKey = process.env.NEXT_PUBLIC_SCRAPERAI_API_KEY || '';
        this.baseUrl = process.env.SCRAPERAI_BASE_URL || 'https://api.scraperai.com/v1';
        break;
      case 'scraperapi':
        this.apiKey = process.env.SCRAPERAPI_API_KEY || '';
        this.baseUrl = 'https://api.scraperapi.com';
        break;
      case 'manual':
        // Manual mode doesn't need API keys
        this.apiKey = '';
        this.baseUrl = '';
        break;
    }

    // Rate limit: 10 requests per minute (adjust per provider)
    this.rateLimiter = new RateLimiter({
      maxRequests: 10,
      windowMs: 60 * 1000,
    });
  }

  async fetchProfile(profileUrl: string): Promise<LinkedInProfile | null> {
    // Manual mode doesn't fetch - data should be provided directly
    if (this.provider === 'manual') {
      console.warn('Manual mode: Profile data should be provided directly, not fetched from URL');
      return null;
    }

    await this.rateLimiter.waitForAvailability();

    try {
      let response: Response;
      
      switch (this.provider) {
        case 'proxycurl':
          response = await this.fetchViaProxycurl(profileUrl);
          break;
        case 'scraperai':
          response = await this.fetchViaScraperAI(profileUrl);
          break;
        case 'scraperapi':
          response = await this.fetchViaScraperAPI(profileUrl);
          break;
        default:
          throw new Error(`Unknown provider: ${this.provider}`);
      }

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          await this.rateLimiter.handleRateLimit(retryAfter);
          return this.fetchProfile(profileUrl);
        }
        throw new Error(`${this.provider} API error: ${response.statusText}`);
      }

      const result = await response.json();
      this.rateLimiter.recordRequest();
      
      return this.normalizeProfileData(result, profileUrl);
    } catch (error) {
      console.error(`Error fetching LinkedIn profile via ${this.provider}:`, error);
      return null;
    }
  }

  private async fetchViaProxycurl(profileUrl: string): Promise<Response> {
    // Proxycurl uses GET with API key in header
    const url = new URL(this.baseUrl);
    url.searchParams.append('url', profileUrl);
    
    return fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
  }

  private async fetchViaScraperAI(profileUrl: string): Promise<Response> {
    return fetch(`${this.baseUrl}/linkedin/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url: profileUrl,
        fields: [
          'name',
          'headline',
          'currentPosition',
          'company',
          'location',
          'experience',
          'education',
          'skills',
          'about',
          'recentPosts',
        ],
      }),
    });
  }

  private async fetchViaScraperAPI(profileUrl: string): Promise<Response> {
    // ScraperAPI uses GET with API key as query param
    const url = new URL(this.baseUrl);
    url.pathname = '/v1';
    url.searchParams.append('api_key', this.apiKey);
    url.searchParams.append('url', profileUrl);
    url.searchParams.append('render', 'false');
    
    return fetch(url.toString(), {
      method: 'GET',
    });
  }

  async fetchProfilesBatch(
    profileUrls: string[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<Map<string, LinkedInProfile>> {
    const results = new Map<string, LinkedInProfile>();
    let completed = 0;

    for (const url of profileUrls) {
      const profile = await this.fetchProfile(url);
      if (profile) {
        results.set(url, profile);
      }
      completed++;
      onProgress?.(completed, profileUrls.length);
    }

    return results;
  }

  private normalizeProfileData(data: any, profileUrl: string): LinkedInProfile {
    // Handle different response formats from different providers
    let normalizedData = data;
    
    // Proxycurl returns data directly
    if (this.provider === 'proxycurl') {
      normalizedData = data;
    }
    // ScraperAI wraps in success/data
    else if (this.provider === 'scraperai' && data.success) {
      normalizedData = data.data;
    }
    // ScraperAPI returns HTML, would need parsing (not ideal for LinkedIn)
    else if (this.provider === 'scraperapi') {
      // ScraperAPI typically returns HTML, not structured JSON for LinkedIn
      // This would require additional parsing
      console.warn('ScraperAPI returns HTML, not structured data. Consider using Proxycurl instead.');
    }

    return {
      name: normalizedData.full_name || normalizedData.name || '',
      headline: normalizedData.headline || normalizedData.tagline || '',
      currentPosition: normalizedData.occupations?.[0]?.title || 
                      normalizedData.currentPosition || 
                      normalizedData.headline?.split(' at ')[0] || '',
      company: normalizedData.occupations?.[0]?.company || 
              normalizedData.company || 
              normalizedData.headline?.split(' at ')[1] || '',
      location: normalizedData.city || normalizedData.location || '',
      experience: normalizedData.experiences?.map((exp: any) => ({
        title: exp.title || exp.occupation || '',
        company: exp.company || exp.company_name || '',
        duration: exp.starts_at && exp.ends_at 
          ? `${exp.starts_at.month}/${exp.starts_at.year} - ${exp.ends_at.month}/${exp.ends_at.year}`
          : exp.duration || '',
        description: exp.description || '',
        location: exp.location || '',
      })) || normalizedData.experience || [],
      education: normalizedData.educations?.map((edu: any) => ({
        school: edu.school || edu.school_name || '',
        degree: edu.degree_name || edu.degree || '',
        field: edu.field_of_study || '',
        duration: edu.starts_at && edu.ends_at
          ? `${edu.starts_at.year} - ${edu.ends_at.year}`
          : edu.duration || '',
      })) || normalizedData.education || [],
      skills: normalizedData.skills || normalizedData.skill_list || [],
      about: normalizedData.summary || normalizedData.about || '',
      posts: normalizedData.recentPosts || normalizedData.posts || [],
      profileUrl,
    };
  }
}
