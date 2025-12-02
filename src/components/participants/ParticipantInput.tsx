'use client';

import { useState, useMemo } from 'react';
import Button from '../ui/Button';

interface Props {
  onProcess: (participants: Array<{ name: string; linkedinUrl?: string }>) => void;
}

export default function ParticipantInput({ onProcess }: Props) {
  const [input, setInput] = useState('');
  const [hackathonName, setHackathonName] = useState('');

  const { validCount, invalidCount, invalidNames } = useMemo(() => {
    const lines = input.split('\n').filter(line => line.trim());
    const invalid: string[] = [];
    let valid = 0;

    lines.forEach(line => {
      const name = line.split('|')[0].trim();
      const nameParts = name.split(/\s+/);
      if (nameParts.length >= 2) {
        valid++;
      } else if (name) {
        invalid.push(name);
      }
    });

    return { validCount: valid, invalidCount: invalid.length, invalidNames: invalid };
  }, [input]);

  const handleProcess = () => {
    const lines = input.split('\n').filter(line => line.trim());
    const parsed = lines
      .map(line => {
        const parts = line.split('|').map(p => p.trim());
        return {
          name: parts[0],
          linkedinUrl: parts[1] || undefined,
        };
      })
      .filter(participant => {
        const nameParts = participant.name.trim().split(/\s+/);
        return nameParts.length >= 2;
      });
    
    if (parsed.length === 0) {
      alert('Please enter at least one participant with a full name (first and last name).');
      return;
    }

    if (invalidCount > 0) {
      const proceed = confirm(
        `${invalidCount} name(s) will be removed because they don't have a last name:\n\n${invalidNames.join(', ')}\n\nContinue with ${validCount} valid participant(s)?`
      );
      if (!proceed) return;
    }
    
    onProcess(parsed);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-base font-semibold text-gray-900">Import Participants</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add participant names to analyze and find networking opportunities
          </p>
        </div>

        {/* Hackathon Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Name
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <input
            type="text"
            value={hackathonName}
            onChange={e => setHackathonName(e.target.value)}
            placeholder="e.g., TechCrunch Disrupt 2024"
            className="input-field"
          />
        </div>
        
        {/* Participant List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Participant List
            </label>
            <div className="flex items-center gap-2">
              {validCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                  {validCount} valid
                </span>
              )}
              {invalidCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700">
                  {invalidCount} incomplete
                </span>
              )}
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter one participant per line:

John Doe
Jane Smith | https://linkedin.com/in/janesmith
Bob Johnson"
            className="input-field h-48 resize-none font-mono text-sm"
          />
          
          {/* Help Text */}
          <div className="mt-3 space-y-2">
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Format: <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">First Last</code> or <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">First Last | LinkedIn URL</code>
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                Names without a last name will be filtered out (required for LinkedIn search)
              </span>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <Button 
          onClick={handleProcess} 
          disabled={!input.trim() || validCount === 0}
          size="lg"
          fullWidth
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        >
          Analyze {validCount > 0 ? `${validCount} Participants` : 'Participants'}
        </Button>
      </div>
    </div>
  );
}
