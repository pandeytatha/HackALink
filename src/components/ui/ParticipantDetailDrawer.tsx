'use client';

import { ReactNode } from 'react';
import type { Participant } from '@/types';
import Avatar from './Avatar';
import Button from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  participant?: Participant | null;
  children?: ReactNode;
}

export default function ParticipantDetailDrawer({
  isOpen,
  onClose,
  participant,
  children,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Participant Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-2 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {participant ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <Avatar 
                  src={participant.linkedinData?.profileImage}
                  name={participant.name}
                  size="xl"
                />
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{participant.name}</h3>
                  {participant.linkedinData?.headline && (
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{participant.linkedinData.headline}</p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {(participant.linkedinData?.profileUrl || participant.linkedinUrl) && (
                <a
                  href={participant.linkedinData?.profileUrl || participant.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#0077b5] text-white rounded-lg text-sm font-medium hover:bg-[#006097] transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  View LinkedIn Profile
                </a>
              )}

              {/* Info Cards */}
              <div className="space-y-3">
                {participant.linkedinData?.company && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Company</p>
                    <p className="text-gray-900 font-medium">{participant.linkedinData.company}</p>
                  </div>
                )}
                
                {participant.linkedinData?.location && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-gray-900 font-medium">{participant.linkedinData.location}</p>
                  </div>
                )}

                {participant.linkedinData?.about && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">About</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{participant.linkedinData.about}</p>
                  </div>
                )}

                {participant.score && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Influence Score</p>
                    <p className="text-2xl font-semibold text-blue-700">{Math.round(participant.score * 100)}%</p>
                  </div>
                )}
              </div>

              {children}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">Select a participant to view details</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {participant && (
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Close
            </Button>
            <Button fullWidth>
              Add to Team
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
