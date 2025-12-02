import { NextRequest, NextResponse } from 'next/server';
import { LLMAnalyzer } from '@/lib/llm-client';
import type { Participant } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { hackathonName, heavyHitters, userExperience } = await request.json();

    if (!hackathonName || !heavyHitters) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const analyzer = new LLMAnalyzer();
    const post = await analyzer.generateLinkedInPost(
      hackathonName,
      heavyHitters as Participant[],
      userExperience
    );

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error generating LinkedIn post:', error);
    return NextResponse.json(
      { error: 'Failed to generate post' },
      { status: 500 }
    );
  }
}

