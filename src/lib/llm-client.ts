import OpenAI from 'openai';
import type { Participant, SimilarityMatch, TeamSuggestion } from '@/types';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({
    apiKey,
    timeout: 30000, // 30 second timeout for all requests
  });
}

export class LLMAnalyzer {
  async identifyHeavyHitters(participants: Participant[], topN: number = 5): Promise<Participant[]> {
    if (participants.length === 0) {
      console.log('[LLM] No participants to analyze');
      return [];
    }

    const participantList = participants.map((p, idx) => 
      `${idx + 1}. ${p.name} - ${p.linkedinData?.currentPosition || 'Unknown role'} at ${p.linkedinData?.company || 'Unknown company'}`
    ).join('\n');

    const prompt = `From these hackathon participants, identify the TOP ${topN} most influential people to network with.

Participants:
${participantList}

Return JSON with ONLY the top ${topN} ranked by career prestige:
{"top": [{"name": "Full Name", "score": 0.95, "reason": "why they're influential"}]}

Score from 0.7 to 1.0. Consider: company prestige (FAANG, top startups), role seniority, career achievements.`;

    try {
      const openai = getOpenAIClient();
      console.log(`[LLM] Finding top ${topN} from ${participants.length} participants...`);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 500,
      });

      const content = response.choices[0].message.content || '{}';
      console.log('[LLM] Response:', content.substring(0, 300));
      
      const result = JSON.parse(content);
      const rankings = result.top || result.rankings || [];
      
      console.log(`[LLM] Got ${rankings.length} top candidates`);

      // Map rankings back to participants
      const topParticipants = rankings
        .slice(0, topN)
        .map((r: { name: string; score: number; reason?: string }) => {
          if (!r.name) return null;
          const participant = participants.find(p => {
            const pName = p.name.toLowerCase().trim();
            const rName = r.name.toLowerCase().trim();
            return pName === rName || 
                   pName.includes(rName) || 
                   rName.includes(pName) ||
                   pName.split(' ')[0] === rName.split(' ')[0];
          });
          if (participant) {
            return { ...participant, score: r.score || 0.8 };
          }
          return null;
        })
        .filter(Boolean) as Participant[];
      
      console.log(`[LLM] Matched ${topParticipants.length} top participants`);
      
      return topParticipants.length > 0 ? topParticipants : this.fallbackRanking(participants, topN);
    } catch (error) {
      console.error('[LLM] Error:', error);
      return this.fallbackRanking(participants, topN);
    }
  }

  private fallbackRanking(participants: Participant[], topN: number = 5): Participant[] {
    return participants.slice(0, topN).map((p, idx) => ({
      ...p,
      score: Math.max(0.7, 1 - (idx * 0.05)),
    }));
  }

  async generateTalkingPoints(participant: Participant): Promise<string[]> {
    const name = participant.name;
    const firstName = name.split(' ')[0];
    const company = participant.linkedinData?.company;
    const position = participant.linkedinData?.currentPosition;
    const headline = participant.linkedinData?.headline;
    const twitter = participant.socialMedia?.twitter;
    const github = participant.socialMedia?.github;
    
    // If no useful data, return generic openers
    if (!company && !position && !headline && !twitter && !github) {
      return [
        `Hey ${firstName}! What brings you to this hackathon?`,
        `What kind of projects are you hoping to work on?`,
        `What's your tech background?`,
      ];
    }

    // Build context from all available sources
    let contextParts: string[] = [];
    
    if (position || company) {
      contextParts.push(`Role: ${position || 'Unknown'} ${company ? `at ${company}` : ''}`);
    }
    if (headline) {
      contextParts.push(`Headline: ${headline}`);
    }
    if (twitter) {
      contextParts.push(`Twitter: ${twitter.handle}`);
      if (twitter.bio) {
        contextParts.push(`Twitter bio: ${twitter.bio}`);
      }
      if (twitter.recentTweets && twitter.recentTweets.length > 0) {
        contextParts.push(`Recent tweets: ${twitter.recentTweets.slice(0, 3).join(' | ')}`);
      }
    }
    if (github) {
      contextParts.push(`GitHub: ${github}`);
    }

    const prompt = `Generate 3 casual conversation starters for meeting ${name} at a hackathon.

Their info:
${contextParts.join('\n')}

Rules: 
- Be friendly and ask questions
- Reference their background, recent tweets, or projects if available
- If they have Twitter activity, use it to make the conversation more personal
- Keep it natural and not creepy
Return JSON: {"points": ["starter 1", "starter 2", "starter 3"]}`;

    try {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 250,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      const points = result.points || result.talkingPoints || [];
      
      if (points.length > 0) {
        console.log(`[LLM] Generated talking points for ${name}`);
        return points;
      }
      return this.fallbackTalkingPoints(firstName, company, position);
    } catch (error) {
      console.error(`[LLM] Error for ${name}:`, error);
      return this.fallbackTalkingPoints(firstName, company, position);
    }
  }

  private fallbackTalkingPoints(firstName: string, company?: string, position?: string): string[] {
    return [
      company ? `Hey! I saw you're at ${company} - what's it like there?` : `Hey ${firstName}! What brings you here?`,
      position ? `As a ${position}, what are you hoping to build?` : `What projects interest you?`,
      `What's your go-to tech stack?`,
    ];
  }

  async findSimilarBackgrounds(
    participants: Participant[],
    userProfile: Participant
  ): Promise<SimilarityMatch[]> {
    const matches: SimilarityMatch[] = [];

    for (const participant of participants) {
      if (participant.id === userProfile.id) continue;

      const commonalities = this.findCommonalities(userProfile, participant);
      if (commonalities.score > 0.3) {
        matches.push({
          participant1: userProfile.id,
          participant2: participant.id,
          participant1Name: userProfile.name,
          participant2Name: participant.name,
          similarityScore: commonalities.score,
          commonalities: commonalities.details,
        });
      }
    }

    return matches.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  private findCommonalities(p1: Participant, p2: Participant): {
    score: number;
    details: SimilarityMatch['commonalities'];
  } {
    const emptyBg = { schools: [] as string[], companies: [] as string[], skills: [] as string[] };
    const p1Bg = p1.background || emptyBg;
    const p2Bg = p2.background || emptyBg;

    const p1Schools = p1Bg.schools || [];
    const p2Schools = p2Bg.schools || [];
    const p1Companies = p1Bg.companies || [];
    const p2Companies = p2Bg.companies || [];
    const p1Skills = p1Bg.skills || [];
    const p2Skills = p2Bg.skills || [];

    const commonSchools = p1Schools.filter(s => p2Schools.includes(s));
    const commonCompanies = p1Companies.filter(c => p2Companies.includes(c));
    const commonSkills = p1Skills.filter(s => p2Skills.includes(s));

    let score = 0;
    if (commonSchools.length > 0) score += 0.4;
    if (commonCompanies.length > 0) score += 0.3;
    if (commonSkills.length > 2) score += 0.2;
    if (commonSkills.length > 5) score += 0.1;

    return {
      score: Math.min(score, 1.0),
      details: { schools: commonSchools, companies: commonCompanies, skills: commonSkills },
    };
  }

  async suggestTeams(participants: Participant[], teamSize: number = 4): Promise<TeamSuggestion[]> {
    if (participants.length < 2) {
      return [];
    }

    const participantList = participants.map((p, idx) => 
      `${idx + 1}. ${p.name} - Skills: ${p.linkedinData?.skills?.slice(0, 5).join(', ') || 'Unknown'}`
    ).join('\n');

    const prompt = `Suggest 3 hackathon teams of ${teamSize} people with complementary skills.

Participants:
${participantList}

Return JSON: {"teams": [{"members": ["Name1", "Name2"], "reason": "why they work well", "skills": ["skill1"]}]}`;

    try {
      const openai = getOpenAIClient();
      console.log(`[LLM] Suggesting teams...`);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 800,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      const teams = result.teams || [];
      
      console.log(`[LLM] Got ${teams.length} team suggestions`);

      return teams.map((team: { members?: string[]; participants?: string[]; reason?: string; reasoning?: string; skills?: string[]; complementarySkills?: string[] }) => ({
        participants: (team.members || team.participants || [])
          .map((name: string) => participants.find(p => 
            p.name.toLowerCase().includes(name?.toLowerCase()) ||
            name?.toLowerCase().includes(p.name.toLowerCase())
          ))
          .filter(Boolean) as Participant[],
        reasoning: team.reason || team.reasoning || 'Complementary skills',
        complementarySkills: team.skills || team.complementarySkills || [],
      })).filter((t: TeamSuggestion) => t.participants.length >= 2);
    } catch (error) {
      console.error('[LLM] Team suggestion error:', error);
      return [];
    }
  }

  async generateLinkedInPost(
    hackathonName: string,
    heavyHitters: Participant[],
    userExperience?: string
  ): Promise<string> {
    const notableRoles = heavyHitters.slice(0, 3)
      .map(p => `${p.linkedinData?.currentPosition} at ${p.linkedinData?.company}`)
      .filter(r => !r.includes('undefined'))
      .join(', ');

    const prompt = `Write a LinkedIn post about attending ${hackathonName || 'a hackathon'}.
${notableRoles ? `Notable attendees included: ${notableRoles}` : ''}
${userExperience ? `My experience: ${userExperience}` : ''}

Make it professional, 2-3 paragraphs, include hashtags.`;

    try {
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
      });

      return response.choices[0].message.content || 'Could not generate post.';
    } catch (error) {
      console.error('[LLM] Post generation error:', error);
      return 'Error generating post. Please try again.';
    }
  }
}
