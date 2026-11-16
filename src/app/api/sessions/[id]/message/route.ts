import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { TutorOrchestrator } from '@/lib/tutor/orchestrator';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const { studentInput } = await request.json();

    if (!studentInput || typeof studentInput !== 'string') {
      return NextResponse.json({ error: 'Missing studentInput' }, { status: 400 });
    }

    // 1. Fetch Session Data
    const session = await prisma.tutorSession.findUnique({
      where: { id: sessionId },
      include: {
        topic: true,
        messages: true,
        whiteboardSession: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Save Student Message (EXACT STUDENT INPUT)
    await prisma.sessionMessage.create({
      data: {
        sessionId,
        sender: 'STUDENT',
        text: studentInput,
        stateAtMsg: session.currentState,
        strategyAtMsg: session.currentStrategy,
      },
    });

    // 2. Process Student Response through Orchestrator
    const tutorResponse = await TutorOrchestrator.processStudentResponse(
      {
        sessionId: session.id,
        topicId: session.topicId,
        topicTitle: session.topic.title,
        state: session.currentState as any,
        strategy: session.currentStrategy as any,
        currentStepIndex: 1,
        attemptsCount: session.messages.filter((m) => m.sender === 'STUDENT').length + 1,
        whiteboardCommands: [],
        conversationHistory: session.messages.map((m) => ({
          sender: m.sender as any,
          text: m.text,
          timestamp: m.createdAt.getTime(),
        })),
        skillsProficiency: {},
        confidenceScore: session.confidenceScore,
      },
      studentInput
    );

    const evaluation = tutorResponse.evaluation || {
      studentSubmittedAnswer: studentInput,
      recognizedAnswer: studentInput,
      normalizedAnswer: studentInput.toLowerCase(),
      expectedAnswer: '3x(x + 4)',
      status: 'UNCLEAR' as const,
      score: 0.0,
      mistakes: [],
      missingSteps: [],
    };

    // FIX #11: Log WHITEBOARD_SUBMITTED Event for Debugger & Audit
    await prisma.sessionEvent.create({
      data: {
        sessionId,
        eventType: 'WHITEBOARD_SUBMITTED',
        payload: JSON.stringify({
          sessionId,
          rawAnswer: studentInput,
          recognizedAnswer: evaluation.recognizedAnswer,
          normalizedAnswer: evaluation.normalizedAnswer,
          expectedAnswer: evaluation.expectedAnswer,
          evaluationStatus: evaluation.status,
          score: evaluation.score,
        }),
      },
    });

    // 3. Update Session State & Progress in DB
    const newConfidenceScore = Math.min(1.0, Math.max(0.0, session.confidenceScore + (evaluation.score * 0.2)));

    await prisma.tutorSession.update({
      where: { id: sessionId },
      data: {
        currentState: tutorResponse.state,
        currentStrategy: tutorResponse.strategy,
        confidenceScore: newConfidenceScore,
        status: tutorResponse.state === 'SESSION_COMPLETE' ? 'COMPLETED' : 'ACTIVE',
      },
    });

    // Update StudentProgress in DB for the user
    try {
      let profile = await prisma.studentProfile.findFirst({
        where: { userId: session.userId },
      });

      if (!profile) {
        profile = await prisma.studentProfile.create({
          data: {
            userId: session.userId,
            overallConfidence: 0.0,
          },
        });
      }

      await prisma.studentProgress.upsert({
        where: {
          profileId_topicId: {
            profileId: profile.id,
            topicId: session.topicId,
          },
        },
        create: {
          profileId: profile.id,
          topicId: session.topicId,
          proficiency: evaluation.score * 0.5,
          sessionsCount: 1,
        },
        update: {
          proficiency: {
            increment: evaluation.score * 0.25,
          },
          sessionsCount: {
            increment: 1,
          },
          lastStudied: new Date(),
        },
      });
    } catch (dbErr) {
      console.warn('StudentProgress update non-fatal:', dbErr);
    }

    // Save Tutor Message
    await prisma.sessionMessage.create({
      data: {
        sessionId,
        sender: 'TUTOR',
        text: tutorResponse.textResponse,
        stateAtMsg: tutorResponse.state,
        strategyAtMsg: tutorResponse.strategy,
      },
    });

    // Log Mistake if detected
    if (tutorResponse.mistakeDetected) {
      await prisma.sessionEvent.create({
        data: {
          sessionId,
          eventType: 'MISTAKE_DETECTED',
          payload: JSON.stringify({
            mistake: tutorResponse.mistakeDetected,
            input: studentInput,
            hintGiven: tutorResponse.hintGiven,
          }),
        },
      });
    }

    // Save Whiteboard commands
    if (session.whiteboardSession && tutorResponse.whiteboardCommands) {
      for (const cmd of tutorResponse.whiteboardCommands) {
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
      tutorResponse,
    });
  } catch (err: any) {
    console.error('Process message error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
