import { LinkedInScraperLegal } from '../linkedin-scraper-legal';
import { SocialMediaScraper } from '../social-media-scraper';
import { LLMAnalyzer } from '../llm-client';
import type {
  Participant,
  TalkingPoint,
  SimilarityMatch,
  TeamSuggestion,
  AnalysisProgress,
} from '@/types';

export class ParticipantService {
  private llmAnalyzer: LLMAnalyzer;
  private socialMediaScraper: SocialMediaScraper;

  constructor() {
    this.llmAnalyzer = new LLMAnalyzer();
    this.socialMediaScraper = new SocialMediaScraper();
  }

  async processParticipants(
    participantList: Array<{
      name: string;
      email?: string;
      company?: string;
      linkedinUrl?: string;
      linkedinData?: any; // Manual input data
    }>,
    userProfile?: Participant,
    onProgress?: (progress: AnalysisProgress) => void
  ): Promise<{
    participants: Participant[];
    heavyHitters: Participant[];
    talkingPoints: TalkingPoint[];
    similarBackgrounds: SimilarityMatch[];
    teamSuggestions: TeamSuggestion[];
  }> {
    // Stage 1: Process participant data
    onProgress?.({
      stage: 'Processing participant data',
      progress: 0.2,
      message: 'Organizing participant information...',
    });

    // Stage 2: Try to fetch via LinkedIn Official API if configured, otherwise use manual data
    onProgress?.({
      stage: 'Fetching LinkedIn data',
      progress: 0.3,
      message: 'Using legal data access methods...',
    });

    const participants: Participant[] = await Promise.all(
      participantList.map(async (p) => {
        let linkedinData = p.linkedinData;

        // Try to fetch profile data using available methods
        if (!linkedinData) {
          // Method 1: Try SerpAPI if configured (searches Google for LinkedIn profiles)
          const serpApiKey = process.env.SERPAPI_API_KEY;
          if (serpApiKey && serpApiKey !== 'your_serpapi_api_key_here') {
            try {
              const index = participantList.findIndex(participant => participant.name === p.name);
              onProgress?.({
                stage: 'Fetching LinkedIn data',
                progress: 0.3 + (index / participantList.length) * 0.3,
                message: `Searching for ${p.name}'s LinkedIn profile...`,
              });
              linkedinData = await LinkedInScraperLegal.fetchViaSerpAPI(p.name, p.company);
              if (linkedinData) {
                console.log(`✅ Found LinkedIn data for ${p.name}`);
              } else {
                console.warn(`⚠️ No LinkedIn profile found for ${p.name} via SerpAPI`);
              }
            } catch (error) {
              console.warn(`Could not fetch ${p.name} via SerpAPI:`, error);
            }
          } else {
            console.warn(`⚠️ SerpAPI not configured. Skipping LinkedIn lookup for ${p.name}. Add SERPAPI_API_KEY to .env.local`);
          }

          // Method 2: Try LinkedIn Official API if configured
          if (!linkedinData && p.linkedinUrl && process.env.LINKEDIN_ACCESS_TOKEN) {
            try {
              linkedinData = await LinkedInScraperLegal.fetchViaOfficialAPI(p.linkedinUrl);
            } catch (error) {
              console.warn(`Could not fetch ${p.name} via LinkedIn API:`, error);
            }
          }
        }

        // If manual data provided, parse it (if not already a LinkedInProfile)
        if (linkedinData && typeof linkedinData === 'object' && !linkedinData.profileUrl) {
          linkedinData = LinkedInScraperLegal.parseManualInput(linkedinData);
        }

        return {
          id: this.generateId(p.name),
          name: p.name,
          email: p.email,
          linkedinUrl: p.linkedinUrl,
          linkedinData,
          background: this.extractBackground(linkedinData),
        };
      })
    );

    // Stage 4: Analyze with LLM (even if no LinkedIn data)
    onProgress?.({
      stage: 'Analyzing participants',
      progress: 0.7,
      message: 'Identifying key participants...',
    });

    // Filter out participants with no data for analysis, but keep them in the list
    const participantsWithData = participants.filter((p: Participant) => p.linkedinData);
    
    console.log(`[ParticipantService] ${participantsWithData.length} of ${participants.length} participants have LinkedIn data`);
    
    // If no LinkedIn data found, still analyze based on names/companies
    const participantsToAnalyze = participantsWithData.length > 0 
      ? participantsWithData 
      : participants; // Fallback to all participants even without LinkedIn data

    // Get only top 5 heavy hitters
    const TOP_N = 5;
    let heavyHitters: Participant[] = [];
    try {
      heavyHitters = await this.llmAnalyzer.identifyHeavyHitters(participantsToAnalyze, TOP_N);
      console.log(`[ParticipantService] LLM returned ${heavyHitters.length} top candidates`);
    } catch (error) {
      console.error('[ParticipantService] Error identifying heavy hitters:', error);
      // Fallback: return top 5 participants with default scores
      heavyHitters = participantsToAnalyze.slice(0, TOP_N).map((p, idx) => ({
        ...p,
        score: 1 - (idx * 0.05),
      }));
    }
    
    // If LLM returned empty, use fallback
    if (heavyHitters.length === 0) {
      console.log('[ParticipantService] LLM returned empty, using fallback');
      heavyHitters = participantsToAnalyze.slice(0, TOP_N).map((p, idx) => ({
        ...p,
        score: 1 - (idx * 0.05),
      }));
    }

    // Fetch social media profiles for heavy hitters
    onProgress?.({
      stage: 'Fetching social media',
      progress: 0.75,
      message: `Finding social media profiles for top ${heavyHitters.length} candidates...`,
    });

    // Enrich heavy hitters with social media data
    const heavyHittersWithSocial = await this.enrichWithSocialMedia(heavyHitters, (completed, total) => {
      onProgress?.({
        stage: 'Fetching social media',
        progress: 0.75 + (completed / total) * 0.1,
        message: `Found social profiles for ${completed}/${total} top candidates...`,
      });
    });

    onProgress?.({
      stage: 'Generating talking points',
      progress: 0.85,
      message: `Creating conversation starters for top ${heavyHittersWithSocial.length} candidates...`,
    });

    // Generate talking points ONLY for the top 5 heavy hitters (now with social media data)
    const talkingPoints = await this.generateAllTalkingPoints(heavyHittersWithSocial);
    
    // Update heavyHitters reference with enriched data
    heavyHitters = heavyHittersWithSocial;

    onProgress?.({
      stage: 'Finding connections',
      progress: 0.9,
      message: 'Matching similar backgrounds...',
    });

    const [similarBackgrounds, teamSuggestions] = await Promise.all([
      userProfile
        ? this.llmAnalyzer.findSimilarBackgrounds(participants, userProfile)
        : Promise.resolve([]),
      this.llmAnalyzer.suggestTeams(participants),
    ]);

    // Count how many participants have LinkedIn data (reuse the variable from above)
    const dataFoundMessage = participantsWithData.length > 0
      ? `Found LinkedIn data for ${participantsWithData.length} of ${participants.length} participants`
      : `No LinkedIn data found. Analysis based on names only.`;

    onProgress?.({
      stage: 'Complete',
      progress: 1.0,
      message: `Analysis complete! ${dataFoundMessage}`,
    });

    return {
      participants,
      heavyHitters,
      talkingPoints,
      similarBackgrounds,
      teamSuggestions,
    };
  }

  private async enrichWithSocialMedia(
    participants: Participant[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<Participant[]> {
    const enriched: Participant[] = [];
    let completed = 0;

    for (const participant of participants) {
      try {
        const socialProfiles = await this.socialMediaScraper.findSocialProfiles(
          participant.name,
          participant.linkedinData?.company
        );

        if (socialProfiles.twitter || socialProfiles.github) {
          console.log(`[ParticipantService] Found social media for ${participant.name}:`, 
            socialProfiles.twitter ? `Twitter: ${socialProfiles.twitter.handle}` : '',
            socialProfiles.github ? `GitHub: ${socialProfiles.github}` : ''
          );
        }

        enriched.push({
          ...participant,
          socialMedia: socialProfiles,
        });
      } catch (error) {
        console.warn(`[ParticipantService] Error fetching social media for ${participant.name}:`, error);
        enriched.push(participant);
      }

      completed++;
      onProgress?.(completed, participants.length);
    }

    return enriched;
  }

  private async generateAllTalkingPoints(
    participants: Participant[]
  ): Promise<TalkingPoint[]> {
    const talkingPoints: TalkingPoint[] = [];
    
    // Only generate for the participants passed in (should be top 5)
    console.log(`[ParticipantService] Generating talking points for ${participants.length} top candidates`);

    // Process sequentially to avoid rate limits
    for (const participant of participants) {
      try {
        const points = await this.llmAnalyzer.generateTalkingPoints(participant);
        
        talkingPoints.push({
          participantId: participant.id,
          participantName: participant.name,
          points: points.length > 0 ? points : this.getDefaultTalkingPoints(participant),
          source: 'linkedin' as const,
        });
      } catch (error) {
        console.warn(`[ParticipantService] Error generating talking points for ${participant.name}:`, error);
        talkingPoints.push({
          participantId: participant.id,
          participantName: participant.name,
          points: this.getDefaultTalkingPoints(participant),
          source: 'linkedin' as const,
        });
      }
    }

    return talkingPoints;
  }

  private getDefaultTalkingPoints(participant: Participant): string[] {
    const firstName = participant.name.split(' ')[0];
    const company = participant.linkedinData?.company;
    const position = participant.linkedinData?.currentPosition;
    
    if (company && position) {
      return [
        `Hey ${firstName}! I saw you're a ${position} at ${company} - what's it like working there?`,
        `What kind of projects are you hoping to build this weekend?`,
        `What's your go-to tech stack?`,
      ];
    } else if (company) {
      return [
        `Hey ${firstName}! I noticed you're at ${company} - what brings you to this hackathon?`,
        `What problems are you most excited to solve this weekend?`,
        `Have you been to hackathons before?`,
      ];
    } else {
      return [
        `Hey ${firstName}! What brings you to this hackathon?`,
        `What kind of projects are you hoping to work on?`,
        `What's your background - are you more into frontend, backend, or something else?`,
      ];
    }
  }

  private extractBackground(linkedinData?: any) {
    if (!linkedinData) return undefined;

    return {
      schools: linkedinData.education?.map((e: any) => e.school) || [],
      companies: linkedinData.experience?.map((e: any) => e.company) || [],
      internships: linkedinData.experience?.filter((e: any) =>
        e.title.toLowerCase().includes('intern')
      ).map((e: any) => e.company) || [],
      research: linkedinData.experience?.filter((e: any) =>
        e.title.toLowerCase().includes('research')
      ).map((e: any) => e.company) || [],
      skills: linkedinData.skills || [],
    };
  }

  private generateId(name: string): string {
    return `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  }
}

