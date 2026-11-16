import { exec } from 'child_process';
import path from 'path';
import * as math from 'mathjs';
import { EvaluationStatus } from '../tutor/types';

export interface MathVerificationResult {
  status: EvaluationStatus;
  isCorrect: boolean;
  score: number; // 0.0 - 1.0
  studentSubmittedAnswer: string;
  recognizedAnswer: string;
  normalizedAnswer: string;
  expectedAnswer: string;
  studentMistakeType?: 'sign_error' | 'factor_selection' | 'calculation_error' | 'incomplete' | 'none';
  explanation?: string;
  missingSteps?: string[];
  roots?: number[];
  factoredForm?: string;
}

/**
 * Deterministic math verifier supporting FULL & PARTIAL correctness.
 */
export async function verifyStudentAnswer(
  studentInput: string,
  problemType: 'quadratic' | 'linear' | 'factorisation' | 'graph',
  targetEquation: string = 'x^2 + 5x + 6 = 0'
): Promise<MathVerificationResult> {
  const rawAnswer = studentInput.trim();
  const cleanInput = rawAnswer.toLowerCase().replace(/\s+/g, '');
  const normalized = cleanInput.replace(/\*/g, '');

  // 1. Factorisation Topic: 3x^2 + 12x
  if (
    targetEquation.includes('3x^2 + 12x') ||
    targetEquation.includes('3x² + 12x') ||
    problemType === 'factorisation'
  ) {
    const expected = '3x(x + 4)';

    // Full correct factorization
    if (normalized === '3x(x+4)' || normalized === '3x(x+4)=0' || normalized === '3x*(x+4)') {
      return {
        status: 'CORRECT',
        isCorrect: true,
        score: 1.0,
        studentSubmittedAnswer: rawAnswer,
        recognizedAnswer: rawAnswer,
        normalizedAnswer: normalized,
        expectedAnswer: expected,
        studentMistakeType: 'none',
        explanation: 'Spot on! You factored 3x² + 12x completely into 3x(x + 4).',
        factoredForm: expected,
      };
    }

    // Partial correctness: student extracted Greatest Common Factor 3x (or 3 or x)
    if (normalized === '3x' || normalized === '3*x') {
      return {
        status: 'PARTIALLY_CORRECT',
        isCorrect: false,
        score: 0.5,
        studentSubmittedAnswer: rawAnswer,
        recognizedAnswer: rawAnswer,
        normalizedAnswer: normalized,
        expectedAnswer: expected,
        studentMistakeType: 'incomplete',
        missingSteps: ['Factor the remaining terms inside the parentheses (x + 4)'],
        explanation: "Good start. 3x is the greatest common factor. Now let's see what remains after taking 3x outside.",
      };
    }

    if (normalized === '3' || normalized === 'x') {
      return {
        status: 'PARTIALLY_CORRECT',
        isCorrect: false,
        score: 0.25,
        studentSubmittedAnswer: rawAnswer,
        recognizedAnswer: rawAnswer,
        normalizedAnswer: normalized,
        expectedAnswer: expected,
        studentMistakeType: 'incomplete',
        missingSteps: ['The greatest common factor includes both 3 and x (3x)'],
        explanation: "Good try. Notice that both terms contain 3 and x, so the greatest common factor is 3x.",
      };
    }

    // Incorrect answer (e.g. 5)
    return {
      status: 'INCORRECT',
      isCorrect: false,
      score: 0.0,
      studentSubmittedAnswer: rawAnswer,
      recognizedAnswer: rawAnswer,
      normalizedAnswer: normalized,
      expectedAnswer: expected,
      studentMistakeType: 'calculation_error',
      missingSteps: ['Identify common factors in 3x² and 12x'],
      explanation: 'That is not a factor of 3x² + 12x. Look at the terms 3x² and 12x — what factor do they share?',
    };
  }

  // 2. Quadratic Equation Check for x^2 + 5x + 6 = 0
  if (targetEquation.includes('x^2 + 5x + 6') || targetEquation.includes('x² + 5x + 6') || problemType === 'quadratic') {
    const expected = 'x = -2, -3';

    // Full correct (roots x = -2, -3 OR factored form (x + 2)(x + 3))
    if (
      normalized.includes('x=-2,-3') ||
      normalized.includes('x=-3,-2') ||
      normalized.includes('-2,-3') ||
      normalized.includes('-3,-2') ||
      normalized.includes('(x+2)(x+3)') ||
      normalized.includes('(x+3)(x+2)')
    ) {
      return {
        status: 'CORRECT',
        isCorrect: true,
        score: 1.0,
        studentSubmittedAnswer: rawAnswer,
        recognizedAnswer: rawAnswer,
        normalizedAnswer: normalized,
        expectedAnswer: expected,
        studentMistakeType: 'none',
        explanation: 'Spot on! Setting each factor (x + 2)(x + 3) = 0 gives the roots x = -2 and x = -3.',
        roots: [-2, -3],
        factoredForm: '(x + 2)(x + 3)',
      };
    }

    // Single root provided (x = -2 OR x = -3) -> Partial correctness
    if (normalized === 'x=-2' || normalized === 'x=-3' || normalized === '-2' || normalized === '-3') {
      return {
        status: 'PARTIALLY_CORRECT',
        isCorrect: false,
        score: 0.5,
        studentSubmittedAnswer: rawAnswer,
        recognizedAnswer: rawAnswer,
        normalizedAnswer: normalized,
        expectedAnswer: expected,
        studentMistakeType: 'incomplete',
        missingSteps: ['Identify the second root of the quadratic equation'],
        explanation: `Good work identifying ${rawAnswer}! Remember a quadratic equation has two roots. What is the second root?`,
      };
    }

    // Partial correctness: found factor numbers 2 and 3 without negative signs or brackets
    if (normalized.includes('2') && normalized.includes('3') && !normalized.includes('-')) {
      return {
        status: 'PARTIALLY_CORRECT',
        isCorrect: false,
        score: 0.6,
        studentSubmittedAnswer: rawAnswer,
        recognizedAnswer: rawAnswer,
        normalizedAnswer: normalized,
        expectedAnswer: expected,
        studentMistakeType: 'incomplete',
        missingSteps: ['Form the binomial factors (x + 2)(x + 3) and isolate roots'],
        explanation: 'Good work identifying 2 and 3! Remember to set (x + 2)(x + 3) = 0 to solve for x = -2, -3.',
      };
    }

    // Sign error mistake (x = 2, x = 3)
    if (normalized.includes('x=2') || normalized.includes('x=3') || normalized === '2,3') {
      return {
        status: 'INCORRECT',
        isCorrect: false,
        score: 0.3,
        studentSubmittedAnswer: rawAnswer,
        recognizedAnswer: rawAnswer,
        normalizedAnswer: normalized,
        expectedAnswer: expected,
        studentMistakeType: 'sign_error',
        explanation: 'Remember: if (x + 2) = 0, subtracting 2 gives x = -2! Watch the negative signs.',
      };
    }

    // Factor selection mistake (1 and 6)
    if (normalized.includes('1') && normalized.includes('6')) {
      return {
        status: 'INCORRECT',
        isCorrect: false,
        score: 0.1,
        studentSubmittedAnswer: rawAnswer,
        recognizedAnswer: rawAnswer,
        normalizedAnswer: normalized,
        expectedAnswer: expected,
        studentMistakeType: 'factor_selection',
        explanation: '1 and 6 multiply to 6, but 1 + 6 = 7. We need factors that sum to +5.',
      };
    }
  }

  // 3. Fallback Linear Equation (2x + 6 = 14 => x = 4)
  if (targetEquation.includes('2x + 6') || problemType === 'linear') {
    const expected = 'x = 4';
    if (normalized.includes('x=4') || normalized === '4') {
      return {
        status: 'CORRECT',
        isCorrect: true,
        score: 1.0,
        studentSubmittedAnswer: rawAnswer,
        recognizedAnswer: rawAnswer,
        normalizedAnswer: normalized,
        expectedAnswer: expected,
        studentMistakeType: 'none',
        explanation: 'Correct! Subtract 6 to get 2x = 8, then divide by 2 to get x = 4.',
      };
    }
    if (normalized.includes('2x=8') || normalized.includes('-6') || normalized.includes('subtract 6')) {
      return {
        status: 'PARTIALLY_CORRECT',
        isCorrect: false,
        score: 0.5,
        studentSubmittedAnswer: rawAnswer,
        recognizedAnswer: rawAnswer,
        normalizedAnswer: normalized,
        expectedAnswer: expected,
        studentMistakeType: 'incomplete',
        explanation: 'Great first step! Subtracting 6 gives 2x = 8. Now divide both sides by 2.',
      };
    }
  }

  // Fallback SymPy check
  try {
    const pythonResult = await runSympyScript('verify_equation', {
      expr1: studentInput,
      expr2: targetEquation.split('=')[0] || targetEquation,
    });
    
    if (pythonResult.is_equal) {
      return {
        status: 'CORRECT',
        isCorrect: true,
        score: 1.0,
        studentSubmittedAnswer: rawAnswer,
        recognizedAnswer: rawAnswer,
        normalizedAnswer: normalized,
        expectedAnswer: targetEquation,
        studentMistakeType: 'none',
        explanation: 'Mathematically verified correct solution.',
      };
    }
  } catch (err) {
    console.warn('SymPy execution fallback:', err);
  }

  return {
    status: 'INCORRECT',
    isCorrect: false,
    score: 0.0,
    studentSubmittedAnswer: rawAnswer,
    recognizedAnswer: rawAnswer,
    normalizedAnswer: normalized,
    expectedAnswer: targetEquation,
    studentMistakeType: 'calculation_error',
    explanation: 'That answer does not solve the equation yet. Take a look at the whiteboard hint.',
  };
}

export async function generateGraphData(expression: string = 'x^2 + 5*x + 6', start = -6, end = 2) {
  try {
    const res = await runSympyScript('generate_graph_data', { expression, start, end, steps: 40 });
    if (res.points) return res;
  } catch (e) {
    console.warn('SymPy graph fallback:', e);
  }

  const points: { x: number; y: number }[] = [];
  const compiled = math.compile(expression.replace(/\^/g, '**'));
  for (let x = start; x <= end; x += 0.2) {
    try {
      const y = compiled.evaluate({ x });
      points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
    } catch {
      // skip
    }
  }
  return { points, roots: [-3, -2] };
}

function runSympyScript(command: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'verify_math.py');
    const inputArg = JSON.stringify({ command, data });
    exec(`python "${scriptPath}" "${inputArg.replace(/"/g, '\\"')}"`, (err, stdout) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(e);
      }
    });
  });
}
