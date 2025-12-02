'use client';

import { useState } from 'react';
import ParticipantInput from '@/components/participants/ParticipantInput';
import AnalysisProgress from '@/components/analysis/AnalysisProgress';
import HeavyHitters from '@/components/analysis/HeavyHitters';
import SimilarityMatch from '@/components/participants/SimilarityMatch';
import TeamSuggestions from '@/components/analysis/TeamSuggestions';
import PostGenerator from '@/components/linkedin/PostGenerator';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import type { 
  Participant, 
  TalkingPoint, 
  SimilarityMatch as SimilarityMatchType, 
  TeamSuggestion,
  AnalysisProgress as AnalysisProgressType 
} from '@/types';

interface Results {
  participants: Participant[];
  heavyHitters: Participant[];
  talkingPoints: TalkingPoint[];
  similarBackgrounds: SimilarityMatchType[];
  teamSuggestions: TeamSuggestion[];
}

export default function DashboardPage() {
  const [participants, setParticipants] = useState<Array<{ name: string; linkedinUrl?: string }>>([]);
  const [hackathonName, setHackathonName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgressType | null>(null);
  const [results, setResults] = useState<Results | null>(null);

  const handleProcess = async (participantList: Array<{ name: string; linkedinUrl?: string }>) => {
    setParticipants(participantList);
    setProcessing(true);
    setResults(null);
    setProgress(null);

    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: participantList }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to process participants: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        console.error('No response body reader available');
        setProcessing(false);
        return;
      }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer) {
            const lines = buffer.split('\n').filter(Boolean);
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.error) {
                    console.error('API Error:', data.error);
                    alert(`Error: ${data.error}`);
                    setProcessing(false);
                    return;
                  }
                  if (data.progress) {
                    setProgress(data.progress);
                  }
                  if (data.results) {
                    console.log('Received results:', data.results);
                    setResults(data.results);
                    setProcessing(false);
                  }
                } catch (e) {
                  console.error('Error parsing data:', e, line);
                }
              }
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                console.error('API Error:', data.error);
                alert(`Error: ${data.error}`);
                setProcessing(false);
                return;
              }
              if (data.progress) {
                setProgress(data.progress);
              }
              if (data.results) {
                console.log('Received results:', data.results);
                setResults(data.results);
                setProcessing(false);
              }
            } catch (e) {
              console.error('Error parsing data:', e, line);
            }
          }
        }
      }

      setProcessing(false);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader 
          title="Analyze Participants"
          subtitle="Upload your hackathon participant list to discover networking opportunities"
        />

        <div className="space-y-8">
          {/* Input Section */}
          {!processing && !results && (
            <ParticipantInput onProcess={handleProcess} />
          )}

          {/* Processing Progress */}
          {processing && progress && (
            <AnalysisProgress progress={progress} />
          )}

          {processing && !progress && (
            <Card>
              <div className="flex items-center justify-center gap-4 py-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <span className="text-neutral-700 font-medium">Initializing analysis...</span>
              </div>
            </Card>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-8">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <p className="text-white/80 text-sm mb-1">Total Analyzed</p>
                  <p className="text-3xl font-bold">{results.participants.length}</p>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <p className="text-white/80 text-sm mb-1">Heavy Hitters</p>
                  <p className="text-3xl font-bold">{results.heavyHitters.length}</p>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                  <p className="text-white/80 text-sm mb-1">Teams Suggested</p>
                  <p className="text-3xl font-bold">{results.teamSuggestions.length}</p>
                </Card>
                <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                  <p className="text-white/80 text-sm mb-1">Talking Points</p>
                  <p className="text-3xl font-bold">{results.talkingPoints.length}</p>
                </Card>
              </div>

              {results.heavyHitters && results.heavyHitters.length > 0 && (
                <HeavyHitters 
                  participants={results.heavyHitters} 
                  talkingPoints={results.talkingPoints}
                />
              )}
              {results.teamSuggestions && results.teamSuggestions.length > 0 && (
                <TeamSuggestions suggestions={results.teamSuggestions} />
              )}
              {results.similarBackgrounds && results.similarBackgrounds.length > 0 && (
                <SimilarityMatch matches={results.similarBackgrounds} />
              )}
              {hackathonName && results.heavyHitters && results.heavyHitters.length > 0 && (
                <PostGenerator
                  hackathonName={hackathonName}
                  heavyHitters={results.heavyHitters}
                />
              )}
              
              {/* No Results State */}
              {(!results.heavyHitters || results.heavyHitters.length === 0) && (
                <Card>
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-3xl">🤔</span>
                    </div>
                    <h3 className="font-bold text-neutral-900 text-xl mb-2">No Results Found</h3>
                    <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                      We couldn't find enough data to analyze. Try providing LinkedIn URLs directly for better results.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left max-w-md mx-auto">
                      <p className="text-sm font-medium text-amber-800 mb-2">💡 Tips:</p>
                      <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                        <li>Add LinkedIn URLs: <code className="bg-amber-100 px-1 rounded">Name | URL</code></li>
                        <li>Use full names for better search accuracy</li>
                        <li>Check the server console for error details</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Start New Analysis */}
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setResults(null);
                    setParticipants([]);
                    setHackathonName('');
                    setProgress(null);
                  }}
                  variant="secondary"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Start New Analysis
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
