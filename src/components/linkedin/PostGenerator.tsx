'use client';

import { useState } from 'react';
import type { Participant } from '@/types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Props {
  hackathonName: string;
  heavyHitters: Participant[];
}

export default function PostGenerator({ hackathonName, heavyHitters }: Props) {
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [userExperience, setUserExperience] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePost = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/linkedin-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hackathonName, heavyHitters, userExperience }),
      });
      const data = await response.json();
      setPost(data.post);
    } catch (error) {
      console.error('Error generating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card 
      title="LinkedIn Post Generator" 
      subtitle="Share your hackathon experience with your network"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Experience
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            value={userExperience}
            onChange={e => setUserExperience(e.target.value)}
            placeholder="Share what you learned, built, or experienced at the hackathon..."
            className="input-field h-28 resize-none"
          />
        </div>
        
        <Button 
          onClick={generatePost} 
          disabled={loading}
          fullWidth
          icon={
            loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )
          }
        >
          {loading ? 'Generating...' : 'Generate Post'}
        </Button>
        
        {post && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0077b5] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Ready to Post</span>
              </div>
              <Button 
                size="sm" 
                variant={copied ? 'primary' : 'secondary'} 
                onClick={copyToClipboard}
                icon={
                  copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )
                }
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{post}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
