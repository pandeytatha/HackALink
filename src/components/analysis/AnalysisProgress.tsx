'use client';

import type { AnalysisProgress as AnalysisProgressType } from '@/types';

interface Props {
  progress: AnalysisProgressType;
}

export default function AnalysisProgress({ progress }: Props) {
  return (
    <div className="glass rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-xl">{progress.stage}</h3>
          <p className="text-gray-500 text-sm mt-0.5">{progress.message}</p>
        </div>
        <div className="ml-auto">
          <span className="text-2xl font-bold gradient-text">{Math.round(progress.progress * 100)}%</span>
        </div>
      </div>
      
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 progress-bar rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress.progress * 100}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-4 text-xs text-gray-400">
        <span>Processing participants...</span>
        <span>Please wait, this may take a minute</span>
      </div>
    </div>
  );
}
