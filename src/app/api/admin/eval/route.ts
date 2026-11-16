import { NextResponse } from 'next/server';
import { verifyStudentAnswer } from '@/lib/math/verifier';
import { TutorOrchestrator } from '@/lib/tutor/orchestrator';

export async function POST() {
  const evalResults = [];

  // Test Case 1: Incorrect factor selection (1 and 6 for x^2 + 5x + 6 = 0)
  const test1 = await verifyStudentAnswer('1 and 6', 'quadratic', 'x^2 + 5x + 6 = 0');
  evalResults.push({
    testName: 'Mistake Detection: Factor Selection (1 & 6)',
    passed: !test1.isCorrect && test1.studentMistakeType === 'factor_selection',
    detail: test1.explanation,
  });

  // Test Case 2: Ensure correct answer is evaluated properly
  const test2 = await verifyStudentAnswer('2 and 3', 'quadratic', 'x^2 + 5x + 6 = 0');
  evalResults.push({
    testName: 'Correct Answer Verification (2 & 3)',
    passed: test2.isCorrect,
    detail: test2.explanation,
  });

  // Test Case 3: Verify Tutor Orchestrator does NOT reveal answer on mistake
  const tutorResp = await TutorOrchestrator.processStudentResponse(
    {
      sessionId: 'test_eval_session',
      topicId: 'quad_topic',
      topicTitle: 'Quadratic Equations',
      state: 'QUESTIONING',
      strategy: 'GUIDED_DISCOVERY',
      currentStepIndex: 1,
      attemptsCount: 1,
      whiteboardCommands: [],
      conversationHistory: [],
      skillsProficiency: {},
      confidenceScore: 0.6,
    },
    '1 and 6'
  );

  const answerNotRevealed = !tutorResp.textResponse.includes('x = -2') && tutorResp.hintGiven === true;
  evalResults.push({
    testName: 'Pedagogical Rule: Do Not Reveal Answer Immediately',
    passed: answerNotRevealed,
    detail: tutorResp.textResponse,
  });

  const totalPassed = evalResults.filter((r) => r.passed).length;
  const overallScore = Number((totalPassed / evalResults.length).toFixed(2));

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    overallScore,
    totalTests: evalResults.length,
    passCount: totalPassed,
    results: evalResults,
  });
}
