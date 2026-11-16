import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    let session = null;
    if (sessionId && sessionId !== 'latest' && sessionId !== 'completed') {
      session = await prisma.tutorSession.findUnique({
        where: { id: sessionId },
        include: {
          topic: true,
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          events: true,
        },
      });
    }

    if (!session) {
      session = await prisma.tutorSession.findFirst({
        orderBy: { startedAt: 'desc' },
        include: {
          topic: true,
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          events: true,
        },
      });
    }

    if (!session) {
      return NextResponse.json({
        success: true,
        summary: {
          topicTitle: 'Algebra Workspace',
          topicSlug: 'quadratic-equations',
          confidenceScore: 0,
          confidenceDelta: '+0%',
          accomplishments: ['Started new 1-on-1 algebra tutoring session'],
          needsPractice: ['Complete a practice problem to identify focus areas'],
          recommendedNext: {
            title: 'Factorisation Practice',
            slug: 'factorisation',
          },
        },
      });
    }

    // Extract student inputs from messages
    const studentMessages = session.messages
      .filter((m) => m.sender === 'STUDENT')
      .map((m) => m.text);

    const accomplishments: string[] = [];
    if (studentMessages.length > 0) {
      studentMessages.forEach((msg) => {
        accomplishments.push(`Submitted answer: "${msg}"`);
      });
    } else {
      accomplishments.push(`Started step-by-step math problem solving on ${session.topic.title}`);
    }

    const mistakeEvents = session.events.filter((e) => e.eventType === 'MISTAKE_DETECTED');
    const needsPractice: string[] = [];

    if (mistakeEvents.length > 0) {
      mistakeEvents.forEach((ev) => {
        try {
          const payload = JSON.parse(ev.payload);
          if (payload.mistake) {
            needsPractice.push(payload.mistake);
          }
        } catch (e) {
          // fallback
        }
      });
    }

    if (needsPractice.length === 0) {
      if (session.topic.slug.includes('factor')) {
        needsPractice.push('Factor pair selection and sign handling');
      } else if (session.topic.slug.includes('linear')) {
        needsPractice.push('Isolating variables across equations');
      } else {
        needsPractice.push('Verifying root values and binomial signs');
      }
    }

    const confScore = Math.min(100, Math.max(0, Math.round(session.confidenceScore * 100)));

    return NextResponse.json({
      success: true,
      summary: {
        sessionId: session.id,
        topicTitle: session.topic.title,
        topicSlug: session.topic.slug,
        confidenceScore: confScore,
        confidenceDelta: `+${confScore}%`,
        accomplishments,
        needsPractice: Array.from(new Set(needsPractice)),
        recommendedNext: {
          title: session.topic.slug.includes('linear') ? 'Factorisation Practice' : 'Quadratic Equations & Graphs',
          slug: session.topic.slug.includes('linear') ? 'factorisation' : 'quadratic-equations',
        },
      },
    });
  } catch (err: any) {
    console.error('Error fetching session summary:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
