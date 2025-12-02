'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import Avatar from '@/components/ui/Avatar';

export default function TeamsPage() {
  const [teams] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <PageHeader 
        title="Team Builder"
        subtitle="Create and manage hackathon teams with AI-powered suggestions"
        actions={
          <Button icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }>
            Create Team
          </Button>
        }
      />

      {teams.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teams Yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
              Analyze participants first to get AI-suggested teams, or create your own teams manually.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => window.location.href = '/dashboard'}>
                Analyze Participants
              </Button>
              <Button variant="secondary">
                Create Manual Team
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Team {idx + 1}</h3>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
                  {team.participants?.length || 0} members
                </span>
              </div>
              
              <div className="flex -space-x-2 mb-4">
                {team.participants?.slice(0, 5).map((p: any, i: number) => (
                  <Avatar 
                    key={i}
                    src={p.linkedinData?.profileImage}
                    name={p.name}
                    size="md"
                  />
                ))}
              </div>

              <p className="text-sm text-gray-500 mb-4 italic leading-relaxed">
                "{team.reasoning}"
              </p>

              <div className="flex flex-wrap gap-1.5">
                {team.complementarySkills?.slice(0, 4).map((skill: string, i: number) => (
                  <span 
                    key={i}
                    className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
