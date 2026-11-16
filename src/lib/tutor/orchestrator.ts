import { TutorState, TeachingStrategy, StudentSessionState, TutorStepResponse, WhiteboardCommand, AnswerEvaluation } from './types';
import { verifyStudentAnswer, generateGraphData } from '../math/verifier';

/**
 * Tutor Orchestrator System
 * Coordinates Reasoning, Math Verification, State Machine, Strategy, and Whiteboard commands.
 */
export class TutorOrchestrator {
  
  /**
   * Initialize a new tutoring session step
   */
  public static async startSession(topicTitle: string, topicSlug: string): Promise<TutorStepResponse> {
    const greetingCommands: WhiteboardCommand[] = [];

    if (topicSlug === 'quadratic-equations') {
      greetingCommands.push(
        {
          id: 'title_1',
          action: 'WRITE',
          content: 'Quadratic Equations Workspace',
          position: { x: 40, y: 35 },
          color: '#0284c7',
        },
        {
          id: 'eq_main',
          action: 'WRITE',
          content: 'x² + 5x + 6 = 0',
          position: { x: 220, y: 110 },
          color: '#0f172a',
          stepLabel: 'QUESTION: ax² + bx + c = 0',
        },
        {
          id: 'question_prompt',
          action: 'WRITE',
          content: 'Goal: Find factors of 6 that add up to 5',
          position: { x: 180, y: 180 },
          color: '#475569',
        }
      );

      return {
        state: 'QUESTIONING',
        strategy: 'GUIDED_DISCOVERY',
        textResponse: "Welcome! Let's work through quadratic equations together on the whiteboard. Look at x² + 5x + 6 = 0. What two numbers multiply to 6 and add up to 5?",
        audioPromptText: "Welcome! Look at x squared plus 5 x plus 6 equals 0. What two numbers multiply to 6 and add up to 5?",
        whiteboardCommands: greetingCommands,
      };
    } else if (topicSlug === 'factorisation') {
      greetingCommands.push(
        {
          id: 'fact_title',
          action: 'WRITE',
          content: 'Factorisation: Common Factors',
          position: { x: 40, y: 35 },
          color: '#0284c7',
        },
        {
          id: 'fact_eq',
          action: 'WRITE',
          content: '3x² + 12x',
          position: { x: 250, y: 110 },
          color: '#0f172a',
          stepLabel: 'QUESTION: Factor expression',
        },
        {
          id: 'fact_prompt',
          action: 'WRITE',
          content: 'Step 1: Identify the Greatest Common Factor (GCF)',
          position: { x: 180, y: 180 },
          color: '#475569',
        }
      );

      return {
        state: 'QUESTIONING',
        strategy: 'GUIDED_DISCOVERY',
        textResponse: "Let's factor 3x² + 12x. What is the greatest common factor between 3x² and 12x?",
        audioPromptText: "Let's factor 3x squared plus 12x. What is the greatest common factor?",
        whiteboardCommands: greetingCommands,
      };
    } else if (topicSlug === 'linear-equations') {
      greetingCommands.push(
        {
          id: 'lin_title',
          action: 'WRITE',
          content: 'Linear Equations Workspace',
          position: { x: 40, y: 35 },
          color: '#0284c7',
        },
        {
          id: 'lin_eq',
          action: 'WRITE',
          content: '2x + 6 = 14',
          position: { x: 250, y: 110 },
          color: '#0f172a',
          stepLabel: 'QUESTION: Solve for x',
        }
      );

      return {
        state: 'QUESTIONING',
        strategy: 'GUIDED_DISCOVERY',
        textResponse: "Welcome! We are solving 2x + 6 = 14. What is our first step to isolate x on the left side?",
        audioPromptText: "Welcome! We are solving 2 x plus 6 equals 14. What is our first step to isolate x?",
        whiteboardCommands: greetingCommands,
      };
    } else {
      greetingCommands.push(
        {
          id: 'graph_header',
          action: 'WRITE',
          content: 'Graphing y = x² + 5x + 6',
          position: { x: 40, y: 35 },
          color: '#0284c7',
        },
        {
          id: 'graph_plot',
          action: 'GRAPH',
          expression: 'x^2 + 5x + 6',
          position: { x: 150, y: 280 },
        }
      );

      return {
        state: 'QUESTIONING',
        strategy: 'GUIDED_DISCOVERY',
        textResponse: "Notice how the parabola crosses the x-axis. Where are the x-intercepts (roots) of this curve?",
        audioPromptText: "Notice how the parabola crosses the x-axis. Where are the roots of this curve?",
        whiteboardCommands: greetingCommands,
      };
    }
  }

  /**
   * Core Evaluation & Adaptive Response Engine
   */
  public static async processStudentResponse(
    sessionState: StudentSessionState,
    studentInput: string
  ): Promise<TutorStepResponse> {
    const { topicTitle, topicId } = sessionState;
    const isFactorisationTopic = topicTitle.toLowerCase().includes('factor') || topicId.includes('factor');

    // 1. Run Math Verification Engine
    const targetEq = isFactorisationTopic ? '3x^2 + 12x' : 'x^2 + 5x + 6 = 0';
    const problemType = isFactorisationTopic ? 'factorisation' : 'quadratic';
    const verification = await verifyStudentAnswer(studentInput, problemType, targetEq);

    const evaluation: AnswerEvaluation = {
      studentSubmittedAnswer: studentInput,
      recognizedAnswer: verification.recognizedAnswer,
      normalizedAnswer: verification.normalizedAnswer,
      expectedAnswer: verification.expectedAnswer,
      status: verification.status,
      score: verification.score,
      mistakes: verification.studentMistakeType && verification.studentMistakeType !== 'none' ? [verification.studentMistakeType] : [],
      missingSteps: verification.missingSteps || [],
    };

    // 2. Handle CORRECT Answer
    if (verification.status === 'CORRECT') {
      const nextCommands: WhiteboardCommand[] = isFactorisationTopic
        ? [
            {
              id: 'step_gcf',
              action: 'WRITE',
              content: 'Greatest Common Factor: 3x',
              position: { x: 220, y: 240 },
              color: '#0284c7',
              stepLabel: 'GCF Step ✓',
            },
            {
              id: 'step_factored',
              action: 'WRITE',
              content: 'Factored Form: 3x(x + 4)',
              position: { x: 220, y: 310 },
              color: '#16a34a',
              stepLabel: 'Factored Form ✓',
            },
            {
              id: 'highlight_factored',
              action: 'HIGHLIGHT',
              targetId: 'step_factored',
              color: 'rgba(22, 163, 74, 0.15)',
            },
          ]
        : [
            {
              id: 'step_factored',
              action: 'WRITE',
              content: '(x + 2)(x + 3) = 0',
              position: { x: 220, y: 240 },
              color: '#16a34a',
              stepLabel: 'Factored Form ✓',
            },
            {
              id: 'step_roots',
              action: 'WRITE',
              content: 'Roots: x = -2, x = -3',
              position: { x: 220, y: 300 },
              color: '#0284c7',
              stepLabel: 'Zero Product Property',
            },
          ];

      const textExplanation = isFactorisationTopic
        ? "Excellent job! You correctly factored 3x² + 12x completely into 3x(x + 4)!"
        : "Excellent job! You got it! (x + 2)(x + 3) = 0, giving roots x = -2 and x = -3.";

      return {
        state: 'SESSION_COMPLETE',
        strategy: 'ENCOURAGE',
        isCorrect: true,
        evaluation,
        textResponse: textExplanation,
        audioPromptText: textExplanation,
        whiteboardCommands: nextCommands,
      };
    }

    // 3. Handle PARTIALLY CORRECT Answer (e.g. Student writes "3x")
    if (verification.status === 'PARTIALLY_CORRECT') {
      const partialCommands: WhiteboardCommand[] = isFactorisationTopic
        ? [
            {
              id: 'step_gcf_part',
              action: 'WRITE',
              content: 'GCF Identified: 3x',
              position: { x: 220, y: 240 },
              color: '#0284c7',
              stepLabel: 'Step 1: GCF Extracted ✓',
            },
            {
              id: 'step_rem_prompt',
              action: 'WRITE',
              content: 'Next Step: 3x( ? )',
              position: { x: 220, y: 300 },
              color: '#d97706',
              stepLabel: 'Step 2: Remaining Terms',
            },
          ]
        : [
            {
              id: 'step_part_quad',
              action: 'WRITE',
              content: 'Factors identified: 2 and 3',
              position: { x: 220, y: 240 },
              color: '#0284c7',
              stepLabel: 'Step 1: Factor pair found ✓',
            },
            {
              id: 'step_form_binomials',
              action: 'WRITE',
              content: 'Form binomials: (x + ?)(x + ?) = 0',
              position: { x: 220, y: 300 },
              color: '#d97706',
            },
          ];

      const textExplanation = verification.explanation || "Good start. 3x is the greatest common factor. Now let's see what remains after taking 3x outside.";

      return {
        state: 'QUESTIONING',
        strategy: 'GUIDED_DISCOVERY',
        isCorrect: false,
        evaluation,
        hintGiven: true,
        textResponse: textExplanation,
        audioPromptText: textExplanation,
        whiteboardCommands: partialCommands,
      };
    }

    // 4. Handle INCORRECT Answer (NEVER reveal answer!)
    const whiteboardCommands: WhiteboardCommand[] = [];

    if (verification.studentMistakeType === 'factor_selection') {
      whiteboardCommands.push({
        id: 'hint_box',
        action: 'WRITE',
        content: 'Factors of 6: (1 × 6 sum = 7) | (2 × 3 sum = 5)',
        position: { x: 180, y: 260 },
        color: '#d97706',
        stepLabel: 'Check factor pair sum',
      });
    } else if (verification.studentMistakeType === 'sign_error') {
      whiteboardCommands.push({
        id: 'hint_sign',
        action: 'WRITE',
        content: 'If (x + a) = 0 ⟹ x = -a',
        position: { x: 180, y: 260 },
        color: '#dc2626',
        stepLabel: 'Sign flip rule',
      });
    } else {
      whiteboardCommands.push({
        id: 'gen_hint_write',
        action: 'WRITE',
        content: isFactorisationTopic
          ? 'Hint: Both 3x² and 12x can be divided by 3x'
          : 'Hint: Find numbers p and q such that p × q = 6 and p + q = 5',
        position: { x: 180, y: 260 },
        color: '#d97706',
      });
    }

    const textResp = verification.explanation || "Let's review this step together. Look at the hint on the whiteboard.";

    return {
      state: 'HINTING',
      strategy: 'HINT',
      isCorrect: false,
      evaluation,
      hintGiven: true,
      mistakeDetected: verification.studentMistakeType || 'general_mistake',
      textResponse: textResp,
      audioPromptText: textResp,
      whiteboardCommands,
    };
  }
}
