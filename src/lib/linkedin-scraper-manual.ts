/**
 * Manual LinkedIn Profile Input
 * 
 * This is a safer alternative to scraping:
 * - Users can copy/paste their LinkedIn profile data
 * - No ToS violations
 * - No rate limiting issues
 * - More reliable
 */

import type { LinkedInProfile } from '@/types';

export class LinkedInScraperManual {
  /**
   * Parse LinkedIn profile from manually provided JSON or structured data
   */
  static parseProfile(data: any): LinkedInProfile | null {
    try {
      // Handle different input formats
      let profileData = data;
      
      // If it's a string, try to parse it as JSON
      if (typeof data === 'string') {
        profileData = JSON.parse(data);
      }

      return {
        name: profileData.name || profileData.full_name || '',
        headline: profileData.headline || profileData.tagline || '',
        currentPosition: profileData.currentPosition || 
                        profileData.occupations?.[0]?.title || 
                        profileData.headline?.split(' at ')[0] || '',
        company: profileData.company || 
                profileData.occupations?.[0]?.company || 
                profileData.headline?.split(' at ')[1] || '',
        location: profileData.location || profileData.city || '',
        experience: this.parseExperience(profileData.experience || profileData.experiences || []),
        education: this.parseEducation(profileData.education || profileData.educations || []),
        skills: profileData.skills || profileData.skill_list || [],
        about: profileData.about || profileData.summary || '',
        posts: profileData.posts || profileData.recentPosts || [],
        profileUrl: profileData.profileUrl || profileData.url || '',
      };
    } catch (error) {
      console.error('Error parsing manual profile:', error);
      return null;
    }
  }

  /**
   * Create a simple form-based profile from basic inputs
   */
  static createProfileFromForm(formData: {
    name: string;
    headline?: string;
    currentPosition?: string;
    company?: string;
    location?: string;
    skills?: string; // Comma-separated
    about?: string;
    profileUrl?: string;
  }): LinkedInProfile {
    return {
      name: formData.name,
      headline: formData.headline || formData.currentPosition || '',
      currentPosition: formData.currentPosition || '',
      company: formData.company || '',
      location: formData.location || '',
      experience: formData.currentPosition && formData.company ? [{
        title: formData.currentPosition,
        company: formData.company,
        duration: 'Present',
      }] : [],
      education: [],
      skills: formData.skills?.split(',').map(s => s.trim()).filter(Boolean) || [],
      about: formData.about || '',
      posts: [],
      profileUrl: formData.profileUrl || '',
    };
  }

  private static parseExperience(experiences: any[]): LinkedInProfile['experience'] {
    return experiences.map(exp => ({
      title: exp.title || exp.occupation || '',
      company: exp.company || exp.company_name || '',
      duration: this.formatDuration(exp),
      description: exp.description || '',
      location: exp.location || '',
    }));
  }

  private static parseEducation(educations: any[]): LinkedInProfile['education'] {
    return educations.map(edu => ({
      school: edu.school || edu.school_name || '',
      degree: edu.degree || edu.degree_name || '',
      field: edu.field || edu.field_of_study || '',
      duration: this.formatEducationDuration(edu),
    }));
  }

  private static formatDuration(exp: any): string {
    if (exp.starts_at && exp.ends_at) {
      const start = `${exp.starts_at.month || ''}/${exp.starts_at.year}`;
      const end = exp.ends_at.month 
        ? `${exp.ends_at.month}/${exp.ends_at.year}`
        : 'Present';
      return `${start} - ${end}`;
    }
    return exp.duration || '';
  }

  private static formatEducationDuration(edu: any): string {
    if (edu.starts_at && edu.ends_at) {
      return `${edu.starts_at.year} - ${edu.ends_at.year}`;
    }
    return edu.duration || '';
  }
}

