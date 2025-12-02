export interface Participant {
  id: string;
  name: string;
  email?: string;
  linkedinUrl?: string;
  linkedinData?: LinkedInProfile;
  socialMedia?: SocialMediaProfiles;
  background?: Background;
  score?: number; // For ranking heavy hitters
}

export interface LinkedInProfile {
  name: string;
  headline: string;
  currentPosition: string;
  company: string;
  location: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  about?: string;
  posts?: Post[];
  profileUrl: string;
  profileImage?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration?: string;
  description?: string;
  location?: string;
}

export interface Education {
  school: string;
  degree: string;
  field?: string;
  duration?: string;
}

export interface Post {
  content: string;
  date: string;
  engagement?: {
    likes: number;
    comments: number;
  };
}

export interface Background {
  schools: string[];
  companies: string[];
  internships: string[];
  research: string[];
  skills: string[];
}

export interface SocialMediaProfiles {
  twitter?: TwitterProfile;
  github?: string;
  website?: string;
}

export interface TwitterProfile {
  handle: string;
  bio?: string;
  recentTweets?: string[];
  followers?: number;
}

export interface TalkingPoint {
  participantId: string;
  participantName: string;
  points: string[];
  source: 'linkedin' | 'twitter' | 'github';
}

export interface SimilarityMatch {
  participant1: string;
  participant2: string;
  participant1Name: string;
  participant2Name: string;
  similarityScore: number;
  commonalities: {
    schools?: string[];
    companies?: string[];
    skills?: string[];
    interests?: string[];
  };
}

export interface TeamSuggestion {
  participants: Participant[];
  reasoning: string;
  complementarySkills: string[];
}

export interface AnalysisProgress {
  stage: string;
  progress: number;
  message?: string;
}

