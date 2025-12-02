'use client';

import type { TalkingPoint } from '@/types';
import Card from '../ui/Card';

interface Props {
  points: TalkingPoint[];
}

export default function TalkingPoints({ points }: Props) {
  return (
    <Card 
      title="Conversation Starters" 
      subtitle="Personalized talking points for networking"
      icon="💬"
    >
      <div className="space-y-6">
        {points.map((point, idx) => (
          <div 
            key={point.participantId} 
            className="animate-fade-in bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">
                {point.participantName.charAt(0)}
              </span>
              {point.participantName}
            </h3>
            <ul className="space-y-2.5">
              {point.points.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-semibold text-indigo-600 border border-indigo-100">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
