'use client';

import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: 'Top Candidates',
      description: 'Identify the most influential participants based on their background and experience',
    },
    {
      title: 'Talking Points',
      description: 'Get AI-generated conversation starters personalized for each person',
    },
    {
      title: 'Team Builder',
      description: 'Find complementary teammates with matching skills and diverse backgrounds',
    },
    {
      title: 'Profile Discovery',
      description: 'Automatically find and enrich LinkedIn profiles for all participants',
    },
    {
      title: 'Smart Rankings',
      description: 'See participants ranked by influence, similarity to you, and team fit',
    },
    {
      title: 'Post Generator',
      description: 'Create professional LinkedIn posts about your hackathon experience',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-blue-500 py-24 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-400/50 rounded-full text-white text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            AI-Powered Networking
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
            Find Your
            <span className="block text-blue-100">Dream Team</span>
          </h1>
          
          <p className="text-lg text-blue-100 max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your hackathon participant list and discover who to network with, 
            get personalized talking points, and find complementary teammates.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-lg hover:bg-blue-50 transition-all duration-200"
            >
              Get Started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              href="/participants"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-medium rounded-lg hover:bg-blue-400/50 transition-all duration-200"
            >
              View Participants
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Everything You Need for Hackathon Networking
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Our AI-powered platform helps you make the most of your hackathon experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold mb-4">
                  {idx + 1}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-8 bg-blue-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Ready to Level Up Your Networking?
          </h2>
          <p className="text-blue-100 mb-8">
            Upload your participant list and let AI help you make the most valuable connections
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-lg hover:bg-blue-50 transition-all duration-200"
          >
            Start Analyzing
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto text-center text-gray-400 text-sm">
          <p>Built for Thanksgiving Hackathon 2025</p>
        </div>
      </div>
    </div>
  );
}
