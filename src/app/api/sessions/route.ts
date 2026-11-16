import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { TutorOrchestrator } from '@/lib/tutor/orchestrator';

export async function POST(request: Request) {
  try {
    const { topicSlug, userId } = await request.json();

    // 1. Get user & topic
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'alex@student.novilearn.edu',
          name: 'Alex Johnson',
          role: 'student',
        },
      });
    }

    let topic = await prisma.topic.findFirst({ where: { slug: topicSlug } });
    if (!topic) {
      topic = await prisma.topic.create({
        data: {
          title: topicSlug.replace('-', ' ').toUpperCase(),
          slug: topicSlug,
          category: 'Algebra',
          description: `Interactive tutoring on ${topicSlug}`,
          subjectId: 'dummy_sub',
        },
      });
    }

    // 2. Initialize Session with 0% baseline confidence for new student
    const session = await prisma.tutorSession.create({
      data: {
        userId: user.id,
        topicId: topic.id,
        status: 'ACTIVE',
        currentState: 'GREETING',
        currentStrategy: 'GUIDED_DISCOVERY',
        confidenceScore: 0.0,
        whiteboardSession: {
          create: {},
        },
      },
      include: {
        whiteboardSession: true,
      },
    });

    // 3. Generate Initial Tutor Greeting & Whiteboard Setup
    const tutorStart = await TutorOrchestrator.startSession(topic.title, topic.slug);

    // Save initial message
    await prisma.sessionMessage.create({
      data: {
        sessionId: session.id,
        sender: 'TUTOR',
        text: tutorStart.textResponse,
        stateAtMsg: tutorStart.state,
        strategyAtMsg: tutorStart.strategy,
      },
    });

    // Save whiteboard events
    if (session.whiteboardSession && tutorStart.whiteboardCommands) {
      for (const cmd of tutorStart.whiteboardCommands) {
        await prisma.whiteboardEvent.create({
          data: {
            whiteboardSessionId: session.whiteboardSession.id,
            action: cmd.action,
            data: JSON.stringify(cmd),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        topicTitle: topic.title,
        topicSlug: topic.slug,
        currentState: tutorStart.state,
        currentStrategy: tutorStart.strategy,
        textResponse: tutorStart.textResponse,
        audioPromptText: tutorStart.audioPromptText,
        whiteboardCommands: tutorStart.whiteboardCommands,
      },
    });
  } catch (err: any) {
    console.error('Session error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
