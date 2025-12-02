'use client';

import type { Participant } from '@/types';
import Avatar from '../ui/Avatar';

interface Props {
  participant: Participant;
  rank?: number;
  showDetails?: boolean;
  onClick?: () => void;
}

export default function ParticipantCard({ participant, rank, showDetails = true, onClick }: Props) {
  const linkedin = participant.linkedinData;
  const linkedinUrl = linkedin?.profileUrl || participant.linkedinUrl;
  
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-amber-100 text-amber-700';
    if (rank === 2) return 'bg-gray-200 text-gray-600';
    if (rank === 3) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <div 
      className={`
        group flex items-start gap-4 p-4 
        bg-white rounded-xl border border-gray-200
        transition-all duration-200 ease-out
        hover:border-gray-300 hover:shadow-sm
        ${onClick ? 'cursor-pointer' : ''}
      `.trim().replace(/\s+/g, ' ')}
      onClick={onClick}
    >
      {/* Rank Badge */}
      {rank && (
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${getRankStyle(rank)}`}>
          {rank}
        </div>
      )}
      
      {/* Avatar */}
      <Avatar 
        src={linkedin?.profileImage} 
        name={participant.name} 
        size="lg"
      />
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {participant.name}
          </h3>
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-gray-400 hover:text-[#0077b5] transition-colors"
              title="View LinkedIn Profile"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          )}
        </div>
        
        {linkedin?.headline && (
          <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
            {linkedin.headline}
          </p>
        )}
        
        {showDetails && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {linkedin?.company && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium border border-gray-100">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {linkedin.company}
              </span>
            )}
            {linkedin?.location && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium border border-gray-100">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {linkedin.location}
              </span>
            )}
            {participant.score && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {Math.round(participant.score * 100)}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
