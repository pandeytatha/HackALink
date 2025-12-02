'use client';

import { useState } from 'react';
import type { Participant, TalkingPoint } from '@/types';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';

interface Props {
  participants: Participant[];
  talkingPoints?: TalkingPoint[];
}

export default function HeavyHitters({ participants, talkingPoints = [] }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getTalkingPointsForParticipant = (participantId: string) => {
    return talkingPoints.find(tp => tp.participantId === participantId)?.points || [];
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-amber-100 text-amber-700';
    if (rank === 2) return 'bg-gray-200 text-gray-600';
    if (rank === 3) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <Card 
      title="Top Candidates" 
      subtitle="Ranked by industry influence and networking potential"
      action={
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
          {participants.length} people
        </span>
      }
    >
      <div className="space-y-2">
        {participants.slice(0, 15).map((participant, idx) => {
          const linkedin = participant.linkedinData;
          const rank = idx + 1;
          const points = getTalkingPointsForParticipant(participant.id);
          const isExpanded = expandedId === participant.id;

          const linkedinUrl = linkedin?.profileUrl || participant.linkedinUrl;

          return (
            <div 
              key={participant.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div 
                className={`group flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ease-out cursor-pointer ${isExpanded ? 'bg-gray-50 border-gray-300 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                onClick={() => setExpandedId(isExpanded ? null : participant.id)}
              >
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${getRankStyle(rank)}`}>
                  {rank}
                </div>
                
                <Avatar src={linkedin?.profileImage} name={participant.name} size="md" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">{participant.name}</h3>
                    {linkedinUrl && (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-gray-300 hover:text-[#0077b5] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="LinkedIn"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                    {participant.socialMedia?.twitter && (
                      <a
                        href={`https://twitter.com/${participant.socialMedia.twitter.handle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-gray-300 hover:text-black transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="Twitter/X"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    )}
                    {participant.socialMedia?.github && (
                      <a
                        href={participant.socialMedia.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-gray-300 hover:text-gray-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="GitHub"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                  {linkedin?.headline && (
                    <p className="text-gray-500 text-sm truncate mt-0.5">{linkedin.headline}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {participant.score && (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                      {Math.round(participant.score * 100)}%
                    </span>
                  )}
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-2 ml-11 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-fade-in">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Conversation Starters</h4>
                  {points.length > 0 ? (
                    <ul className="space-y-2.5">
                      {points.slice(0, 3).map((point, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">{i + 1}</span>
                          <p className="text-sm text-gray-600 leading-relaxed">"{point}"</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Run analysis to generate personalized conversation starters</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {participants.length > 15 && (
        <p className="text-center text-gray-400 text-sm mt-4 pt-4 border-t border-gray-100">
          Showing top 15 of {participants.length} participants
        </p>
      )}
    </Card>
  );
}
