import { NextRequest, NextResponse } from 'next/server';
import { ParticipantService } from '@/lib/services/participant-service';
import type { AnalysisProgress } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { participants } = await request.json();

    if (!participants || !Array.isArray(participants)) {
      return NextResponse.json(
        { error: 'Invalid participants data' },
        { status: 400 }
      );
    }

    // Debug: Log environment variable status
    const serpApiKey = process.env.SERPAPI_API_KEY;
    console.log('SerpAPI key configured:', serpApiKey ? (serpApiKey !== 'your_serpapi_api_key_here' ? 'Yes (valid)' : 'No (placeholder)') : 'No (missing)');

    // Use legal methods only (manual input or LinkedIn Official API)
    const service = new ParticipantService();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendProgress = (progress: AnalysisProgress) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ progress })}\n\n`)
          );
        };

        try {
          const results = await service.processParticipants(
            participants,
            undefined, // userProfile - could be extracted from session
            sendProgress
          );

          // Log summary of results
          console.log('Processing complete:', {
            totalParticipants: results.participants.length,
            withLinkedInData: results.participants.filter(p => p.linkedinData).length,
            heavyHitters: results.heavyHitters.length,
            talkingPoints: results.talkingPoints.length,
          });

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ results })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error('Error in processParticipants:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`)
          );
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in participants API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

