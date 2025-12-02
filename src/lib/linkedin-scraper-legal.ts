/**
 * Legal LinkedIn Data Access Methods
 * 
 * This module supports only legal ways to access LinkedIn data:
 * 1. Manual Input - Users provide their own profile data
 * 2. LinkedIn Official API - Requires LinkedIn Developer approval
 * 3. SerpAPI - Uses Google search results to find LinkedIn profiles (legal)
 * 4. User Export - Users export their own LinkedIn data
 */

import { RateLimiter } from './rate-limiter';
import type { LinkedInProfile } from '@/types';

export class LinkedInScraperLegal {
  private static rateLimiter = new RateLimiter({
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 requests per minute
  });
  /**
   * Method 1: Manual Input
   * Users manually enter or paste their LinkedIn profile information
   */
  static parseManualInput(data: {
    name: string;
    headline?: string;
    currentPosition?: string;
    company?: string;
    location?: string;
    experience?: Array<{
      title: string;
      company: string;
      duration?: string;
      description?: string;
    }>;
    education?: Array<{
      school: string;
      degree: string;
      field?: string;
      duration?: string;
    }>;
    skills?: string[];
    about?: string;
    profileUrl?: string;
  }): LinkedInProfile {
    return {
      name: data.name,
      headline: data.headline || data.currentPosition || '',
      currentPosition: data.currentPosition || data.headline?.split(' at ')[0] || '',
      company: data.company || data.headline?.split(' at ')[1] || '',
      location: data.location || '',
      experience: data.experience || [],
      education: data.education || [],
      skills: data.skills || [],
      about: data.about || '',
      posts: [],
      profileUrl: data.profileUrl || '',
    };
  }

  /**
   * Method 2: LinkedIn Official API
   * Requires LinkedIn Developer account and API approval
   * See: https://learn.microsoft.com/en-us/linkedin/
   */
  static async fetchViaOfficialAPI(profileUrl: string): Promise<LinkedInProfile | null> {
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.warn('LinkedIn API access token not configured. Please set LINKEDIN_ACCESS_TOKEN in .env.local');
      return null;
    }

    try {
      // Extract profile ID from URL
      const profileId = this.extractProfileId(profileUrl);
      if (!profileId) {
        return null;
      }

      // LinkedIn API endpoint for profile data
      // Note: Requires specific API permissions and approval
      const response = await fetch(
        `https://api.linkedin.com/v2/people/${profileId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      if (!response.ok) {
        console.error('LinkedIn API error:', response.statusText);
        return null;
      }

      const data = await response.json();
      return this.parseLinkedInAPIResponse(data, profileUrl);
    } catch (error) {
      console.error('Error fetching from LinkedIn API:', error);
      return null;
    }
  }

  /**
   * Method 3: SerpAPI - Search for LinkedIn profiles via Google
   * Legal method that uses Google search results to find LinkedIn profiles
   * Get API key from: https://serpapi.com/
   */
  static async fetchViaSerpAPI(name: string, company?: string): Promise<LinkedInProfile | null> {
    // Try both server-side and client-side env vars
    const apiKey = process.env.SERPAPI_API_KEY || process.env.NEXT_PUBLIC_SERPAPI_API_KEY;
    
    if (!apiKey || apiKey === 'your_serpapi_api_key_here') {
      console.warn('SerpAPI key not configured. Please set SERPAPI_API_KEY in .env.local');
      console.warn('Current env check:', {
        SERPAPI_API_KEY: process.env.SERPAPI_API_KEY ? (process.env.SERPAPI_API_KEY.substring(0, 10) + '...') : 'not set',
        NEXT_PUBLIC_SERPAPI_API_KEY: process.env.NEXT_PUBLIC_SERPAPI_API_KEY ? 'set' : 'not set',
      });
      return null;
    }
    
    console.log(`[SerpAPI] Searching for: "${name}"${company ? ` at ${company}` : ''}`);
    console.log(`[SerpAPI] Using key: ${apiKey.substring(0, 10)}...`);

    await this.rateLimiter.waitForAvailability();

    try {
      // Build Google search query for LinkedIn profile
      const query = company 
        ? `site:linkedin.com/in/ "${name}" "${company}"`
        : `site:linkedin.com/in/ "${name}"`;

      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.append('engine', 'google');
      url.searchParams.append('q', query);
      url.searchParams.append('api_key', apiKey);
      url.searchParams.append('num', '5'); // Get top 5 results

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SerpAPI HTTP error:', response.status, response.statusText);
        console.error('SerpAPI error details:', errorText);
        return null;
      }

      const data = await response.json();
      this.rateLimiter.recordRequest();

      // Debug: Log the response structure
      if (data.error) {
        console.error('SerpAPI API error:', data.error);
        return null;
      }

      // Extract LinkedIn profile from search results
      const linkedInResults = data.organic_results?.filter((result: any) => 
        result.link?.includes('linkedin.com/in/')
      ) || [];

      if (linkedInResults.length === 0) {
        console.warn(`No LinkedIn profile found for "${name}" via SerpAPI. Search query: "${query}"`);
        console.log('SerpAPI response:', JSON.stringify(data, null, 2).substring(0, 500));
        return null;
      }

      // Use the first (most relevant) result
      const linkedInResult = linkedInResults[0];
      console.log(`Found ${linkedInResults.length} LinkedIn result(s) for "${name}"`);

      // Extract profile data from search result snippet
      const profile = this.parseSerpAPIResult(linkedInResult, name);
      console.log(`[SerpAPI] Found profile for "${name}":`, profile.profileUrl);
      return profile;
    } catch (error) {
      console.error('Error fetching from SerpAPI:', error);
      return null;
    }
  }

  /**
   * Parse SerpAPI search result into LinkedInProfile
   */
  private static parseSerpAPIResult(result: any, name: string): LinkedInProfile {
    const snippet = result.snippet || '';
    const title = result.title || '';
    const profileUrl = result.link || '';
    
    // Extract profile image from SerpAPI result
    // Try multiple sources for the profile image
    let profileImage = '';
    
    // 1. Try thumbnail (most common for LinkedIn results)
    if (result.thumbnail) {
      profileImage = result.thumbnail;
    }
    // 2. Try rich snippet extensions
    else if (result.rich_snippet?.top?.extensions) {
      const imgExt = result.rich_snippet.top.extensions.find((ext: any) => 
        typeof ext === 'string' && ext.includes('http')
      );
      if (imgExt) {
        profileImage = imgExt;
      }
    }
    // 3. Try inline images
    else if (result.inline_images?.[0]?.thumbnail) {
      profileImage = result.inline_images[0].thumbnail;
    }
    // 4. Try sitelinks (sometimes contains profile image)
    else if (result.sitelinks?.inline?.[0]?.thumbnail) {
      profileImage = result.sitelinks.inline[0].thumbnail;
    }
    
    // Extract headline/position from snippet or title
    // Try multiple patterns to extract position and company
    let headline = '';
    let company = '';
    let currentPosition = '';

    // Pattern 1: "Position at Company" or "Position @ Company"
    const atPattern = snippet.match(/(.+?)\s+(?:at|@)\s+(.+?)(?:\n|·|$|\.)/i);
    if (atPattern) {
      currentPosition = atPattern[1].trim();
      company = atPattern[2].trim();
      headline = `${currentPosition} at ${company}`;
    } else {
      // Pattern 2: Extract from title (usually "Name | Position at Company | LinkedIn")
      const titleParts = title.split('|').map((p: string) => p.trim());
      if (titleParts.length > 1) {
        headline = titleParts[1] || titleParts[0];
        const headlineAt = headline.split(' at ');
        currentPosition = headlineAt[0] || '';
        company = headlineAt[1] || '';
      } else {
        // Pattern 3: Just use first line of snippet
        headline = snippet.split('\n')[0] || snippet.substring(0, 100) || title;
        currentPosition = headline.split(' at ')[0] || '';
        company = headline.split(' at ')[1] || '';
      }
    }

    // Extract location if mentioned in snippet
    const locationMatch = snippet.match(/(?:📍|Location:|,)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    const location = locationMatch ? locationMatch[1] : '';

    return {
      name,
      headline: headline || currentPosition || '',
      currentPosition: currentPosition || '',
      company: company || '',
      location: location || '',
      experience: [],
      education: [],
      skills: [],
      about: snippet || '',
      posts: [],
      profileUrl,
      profileImage,
    };
  }

  /**
   * Method 4: Parse LinkedIn Data Export
   * Users can export their LinkedIn data and upload it
   */
  static parseLinkedInExport(exportData: any): LinkedInProfile | null {
    try {
      // LinkedIn export format varies, but typically includes:
      return {
        name: exportData.Profile?.FirstName + ' ' + exportData.Profile?.LastName || '',
        headline: exportData.Profile?.Headline || '',
        currentPosition: exportData.Positions?.values?.[0]?.title || '',
        company: exportData.Positions?.values?.[0]?.companyName || '',
        location: exportData.Profile?.Location?.name || '',
        experience: exportData.Positions?.values?.map((pos: any) => ({
          title: pos.title || '',
          company: pos.companyName || '',
          duration: pos.startDate ? `${pos.startDate.month}/${pos.startDate.year} - ${pos.endDate ? `${pos.endDate.month}/${pos.endDate.year}` : 'Present'}` : '',
          description: pos.description || '',
        })) || [],
        education: exportData.Educations?.values?.map((edu: any) => ({
          school: edu.schoolName || '',
          degree: edu.degree || '',
          field: edu.fieldOfStudy || '',
          duration: edu.startDate ? `${edu.startDate.year} - ${edu.endDate?.year || 'Present'}` : '',
        })) || [],
        skills: exportData.Skills?.values?.map((skill: any) => skill.name) || [],
        about: exportData.Profile?.Summary || '',
        posts: [],
        profileUrl: exportData.Profile?.PublicProfileUrl || '',
      };
    } catch (error) {
      console.error('Error parsing LinkedIn export:', error);
      return null;
    }
  }

  private static extractProfileId(url: string): string | null {
    // Extract LinkedIn profile ID from URL
    // Format: https://www.linkedin.com/in/username or https://linkedin.com/in/username
    const match = url.match(/linkedin\.com\/in\/([^\/\?]+)/);
    return match ? match[1] : null;
  }

  private static parseLinkedInAPIResponse(data: any, profileUrl: string): LinkedInProfile {
    return {
      name: `${data.localizedFirstName || ''} ${data.localizedLastName || ''}`.trim(),
      headline: data.headline?.localized?.en_US || '',
      currentPosition: data.headline?.localized?.en_US?.split(' at ')[0] || '',
      company: data.headline?.localized?.en_US?.split(' at ')[1] || '',
      location: data.location?.name || '',
      experience: [], // Would need additional API calls
      education: [], // Would need additional API calls
      skills: [], // Would need additional API calls
      about: data.summary?.localized?.en_US || '',
      posts: [],
      profileUrl,
    };
  }
}

