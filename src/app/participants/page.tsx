'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import ParticipantDetailDrawer from '@/components/ui/ParticipantDetailDrawer';
import Avatar from '@/components/ui/Avatar';
import type { Participant } from '@/types';

const placeholderParticipants: Participant[] = [];

export default function ParticipantsPage() {
  const [participants] = useState<Participant[]>(placeholderParticipants);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'vital', label: 'Vital' },
    { id: 'high-score', label: 'High Score' },
    { id: 'recent', label: 'Recent' },
  ];

  const handleCardClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsDrawerOpen(true);
  };

  const filteredParticipants = participants.filter((p) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(search) ||
        p.linkedinData?.company?.toLowerCase().includes(search) ||
        p.linkedinData?.headline?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <PageHeader 
        title="Your Network"
        subtitle="View and manage all participants from your hackathons"
        actions={
          <Button icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }>
            Import Participants
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Participants</p>
          <p className="text-2xl font-semibold text-gray-900">{participants.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">With LinkedIn</p>
          <p className="text-2xl font-semibold text-gray-900">
            {participants.filter(p => p.linkedinData).length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Top Candidates</p>
          <p className="text-2xl font-semibold text-gray-900">
            {participants.filter(p => p.score && p.score > 0.8).length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Pending Review</p>
          <p className="text-2xl font-semibold text-gray-900">
            {participants.filter(p => !p.linkedinData).length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
              activeFilter === filter.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Participant Grid */}
      {filteredParticipants.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Participants Yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
              {searchTerm
                ? 'No participants found matching your search'
                : 'Start by analyzing participants from the dashboard or importing a CSV file'}
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Analyze Participants
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredParticipants.map((participant) => (
            <div
              key={participant.id}
              onClick={() => handleCardClick(participant)}
              className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 ${
                selectedParticipant?.id === participant.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar 
                  src={participant.linkedinData?.profileImage}
                  name={participant.name}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {participant.name}
                  </h3>
                  {participant.linkedinData?.headline && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {participant.linkedinData.headline}
                    </p>
                  )}
                  {participant.linkedinData?.profileUrl && (
                    <a
                      href={participant.linkedinData.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#0077b5] mt-2 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ParticipantDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedParticipant(null);
        }}
        participant={selectedParticipant}
      />
    </div>
  );
}
