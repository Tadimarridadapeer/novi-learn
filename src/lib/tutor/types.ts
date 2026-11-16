export type TutorState =
  | 'GREETING'
  | 'LISTENING'
  | 'UNDERSTANDING'
  | 'THINKING'
  | 'EXPLAINING'
  | 'QUESTIONING'
  | 'EVALUATING'
  | 'CORRECTING'
  | 'HINTING'
  | 'DEMONSTRATING'
  | 'ENCOURAGING'
  | 'ADAPTING'
  | 'NEXT_CONCEPT'
  | 'SESSION_COMPLETE';

export type TeachingStrategy =
  | 'EXPLAIN'
  | 'GUIDED_DISCOVERY'
  | 'HINT'
  | 'DEMONSTRATE'
  | 'CORRECT'
  | 'CHALLENGE'
  | 'REVIEW'
  | 'ENCOURAGE';

export type WhiteboardActionType =
  | 'WRITE'
  | 'DRAW'
  | 'ERASE'
  | 'HIGHLIGHT'
  | 'MOVE'
  | 'GRAPH'
  | 'CIRCLE'
  | 'ARROW'
  | 'CLEAR'
  | 'FOCUS';

export interface WhiteboardCommand {
  id: string;
  action: WhiteboardActionType;
  content?: string;
  position?: { x: number; y: number };
  targetId?: string;
  expression?: string;
  color?: string;
  stepLabel?: string;
}

export type EvaluationStatus = 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT' | 'UNCLEAR';

export interface AnswerEvaluation {
  studentSubmittedAnswer: string;
  recognizedAnswer: string;
  normalizedAnswer: string;
  expectedAnswer: string;
  status: EvaluationStatus;
  score: number;
  mistakes: string[];
  missingSteps: string[];
  nextStrategy?: TeachingStrategy;
}

export interface StudentSessionState {
  sessionId: string;
  topicId: string;
  topicTitle: string;
  state: TutorState;
  strategy: TeachingStrategy;
  currentStepIndex: number;
  attemptsCount: number;
  studentMistake?: string;
  whiteboardCommands: WhiteboardCommand[];
  conversationHistory: { sender: 'STUDENT' | 'TUTOR' | 'SYSTEM'; text: string; timestamp: number }[];
  skillsProficiency: Record<string, number>;
  confidenceScore: number;
}

export interface TutorStepResponse {
  state: TutorState;
  strategy: TeachingStrategy;
  textResponse: string;
  audioPromptText?: string;
  whiteboardCommands: WhiteboardCommand[];
  isCorrect?: boolean;
  evaluation?: AnswerEvaluation;
  hintGiven?: boolean;
  mistakeDetected?: string;
}
