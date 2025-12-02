'use client';

import type { SimilarityMatch as SimilarityMatchType } from '@/types';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';

interface Props {
  matches: SimilarityMatchType[];
}

export default function SimilarityMatch({ matches }: Props) {
  return (
    <Card 
      title="Similar Backgrounds" 
      subtitle="Participants who share common experiences with you"
      action={
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
          {matches.length} matches
        </span>
      }
    >
      <div className="space-y-3">
        {matches.map((match, idx) => (
          <div 
            key={`${match.participant1}-${match.participant2}`}
            className="animate-fade-in p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar name={match.participant2Name} size="md" />
                <div>
                  <h4 className="font-medium text-gray-900">{match.participant2Name}</h4>
                  <p className="text-xs text-gray-500">Similarity Match</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-blue-600">
                  {Math.round(match.similarityScore * 100)}%
                </div>
                <div className="text-xs text-gray-400">match</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {match.commonalities.schools && match.commonalities.schools.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <span className="text-gray-600">
                    Same school: {match.commonalities.schools.join(', ')}
                  </span>
                </div>
              )}
              {match.commonalities.companies && match.commonalities.companies.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-gray-600">
                    Same company: {match.commonalities.companies.join(', ')}
                  </span>
                </div>
              )}
              {match.commonalities.skills && match.commonalities.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {match.commonalities.skills.slice(0, 5).map((skill, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">
              No similarity matches found. Add your profile to find participants with similar backgrounds.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
