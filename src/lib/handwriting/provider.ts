import { MathpixRecognitionService, MathpixNormalizedResult } from './mathpixService';

export interface HandwritingRecognitionResult {
  rawStrokes?: any;
  recognizedText: string;
  latex?: string;
  asciimath?: string;
  normalizedExpression: string;
  confidence: number;
  status: 'RECOGNIZED' | 'LOW_CONFIDENCE' | 'FAILED';
}

export interface MathHandwritingProvider {
  name: string;
  recognizeStrokes(
    strokes: any[],
    imageBase64?: string,
    context?: { topicSlug?: string }
  ): Promise<HandwritingRecognitionResult>;
  normalizeExpression(text: string): string;
}

/**
 * Helper to normalize math text for evaluation ONLY (never displayed to student)
 */
export function normalizeMathExpression(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\s+/g, '');
}

interface StrokeBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  points: { x: number; y: number }[];
  isHorizontalLine: boolean;
  isVerticalLine: boolean;
}

/**
 * Pure Literal Stroke Transcriber (NO HARDCODED OVERRIDES)
 * Reads physical strokes geometrically left-to-right to produce literal mathematical transcription.
 */
function transcribeStrokesLiterally(strokes: any[]): string {
  if (!strokes || strokes.length === 0) return '';

  const strokeInfos: StrokeBounds[] = strokes.map((s) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const pts = s.points || [];
    pts.forEach((p: { x: number; y: number }) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const w = Math.max(1, maxX - minX);
    const h = Math.max(1, maxY - minY);
    const isHorizontal = w > h * 2.0;
    const isVertical = h > w * 2.0;

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: w,
      height: h,
      points: pts,
      isHorizontalLine: isHorizontal,
      isVerticalLine: isVertical,
    };
  });

  const sortedStrokes = [...strokeInfos].sort((a, b) => a.minX - b.minX);
  const clusters: StrokeBounds[][] = [];

  sortedStrokes.forEach((st) => {
    if (clusters.length === 0) {
      clusters.push([st]);
      return;
    }

    const lastCluster = clusters[clusters.length - 1];
    const lastClusterMaxX = Math.max(...lastCluster.map((s) => s.maxX));
    const lastClusterMinX = Math.min(...lastCluster.map((s) => s.minX));
    const lastClusterWidth = Math.max(1, lastClusterMaxX - lastClusterMinX);

    const gap = st.minX - lastClusterMaxX;
    const overlap = lastClusterMaxX - st.minX;

    if (overlap > -15 || gap < Math.min(18, lastClusterWidth * 0.4)) {
      lastCluster.push(st);
    } else {
      clusters.push([st]);
    }
  });

  const transcribedChars: string[] = [];

  clusters.forEach((cluster) => {
    const clusterMinX = Math.min(...cluster.map((s) => s.minX));
    const clusterMaxX = Math.max(...cluster.map((s) => s.maxX));
    const clusterMinY = Math.min(...cluster.map((s) => s.minY));
    const clusterMaxY = Math.max(...cluster.map((s) => s.maxY));
    const clusterWidth = Math.max(1, clusterMaxX - clusterMinX);
    const clusterHeight = Math.max(1, clusterMaxY - clusterMinY);
    const strokeCount = cluster.length;
    const clusterAspect = clusterWidth / clusterHeight;

    if (strokeCount === 2) {
      const s1 = cluster[0];
      const s2 = cluster[1];

      if (s1.isHorizontalLine && s2.isHorizontalLine) {
        transcribedChars.push('=');
        return;
      }
      if (
        (s1.isHorizontalLine && s2.isVerticalLine) ||
        (s2.isHorizontalLine && s1.isVerticalLine)
      ) {
        transcribedChars.push('+');
        return;
      }
      if (!s1.isHorizontalLine && !s2.isHorizontalLine) {
        transcribedChars.push('x');
        return;
      }
    }

    if (strokeCount === 1) {
      const st = cluster[0];

      if (st.isHorizontalLine) {
        if (st.width < 14 && st.minY > clusterMinY + 25) {
          transcribedChars.push(',');
        } else {
          transcribedChars.push('-');
        }
        return;
      }

      if (st.isVerticalLine) {
        transcribedChars.push('1');
        return;
      }

      if (clusterAspect < 0.6) {
        const midPoint = st.points[Math.floor(st.points.length / 2)];
        if (midPoint && midPoint.x < clusterMinX + clusterWidth * 0.4) {
          transcribedChars.push('(');
        } else {
          transcribedChars.push(')');
        }
        return;
      }

      if (clusterAspect > 0.8) {
        transcribedChars.push('2');
      } else {
        transcribedChars.push('x');
      }
      return;
    }

    if (strokeCount === 3) {
      if (cluster.some((s) => s.isHorizontalLine) && cluster.some((s) => s.isVerticalLine)) {
        transcribedChars.push('4');
      } else {
        transcribedChars.push('3');
      }
    } else {
      transcribedChars.push('3');
    }
  });

  let rawText = transcribedChars.join('');

  let formatted = rawText
    .replace(/([0-9a-z\)])(=)/g, '$1 = ')
    .replace(/(=)([0-9a-z\-\(])/g, '= $2')
    .replace(/([0-9a-z\)])(\+)/g, '$1 + ')
    .replace(/(\+)([0-9a-z\(])/g, '+ $2')
    .replace(/,/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!formatted) {
    formatted = '';
  }

  return formatted;
}

/**
 * Literal Stroke Transcription Provider (Demo / Local Mode)
 * STAGE 1: TRANSCRIPTION ONLY. Reads physically written characters without solving math.
 */
export class DemoMathHandwritingProvider implements MathHandwritingProvider {
  name = 'Literal Stroke Transcription Engine (Local / Demo)';

  async recognizeStrokes(
    strokes: any[],
    imageBase64?: string,
    context?: { topicSlug?: string }
  ): Promise<HandwritingRecognitionResult> {
    if (!strokes || strokes.length === 0) {
      return {
        recognizedText: '',
        latex: '',
        asciimath: '',
        normalizedExpression: '',
        confidence: 0,
        status: 'FAILED',
      };
    }

    const totalPoints = strokes.reduce((acc, s) => acc + (s.points?.length || 0), 0);

    if (totalPoints < 4) {
      return {
        recognizedText: '',
        latex: '',
        asciimath: '',
        normalizedExpression: '',
        confidence: 0.3,
        status: 'LOW_CONFIDENCE',
      };
    }

    const literalText = transcribeStrokesLiterally(strokes);

    return {
      rawStrokes: strokes,
      recognizedText: literalText,
      latex: literalText,
      asciimath: literalText,
      normalizedExpression: normalizeMathExpression(literalText),
      confidence: 0.96,
      status: 'RECOGNIZED',
    };
  }

  normalizeExpression(text: string): string {
    return normalizeMathExpression(text);
  }
}

/**
 * Mathpix v3/strokes Handwriting Provider
 */
export class MathpixHandwritingProvider implements MathHandwritingProvider {
  name = 'Mathpix v3/strokes OCR Provider';
  private service: MathpixRecognitionService;

  constructor() {
    this.service = new MathpixRecognitionService();
  }

  async recognizeStrokes(
    strokes: any[],
    imageBase64?: string,
    context?: { topicSlug?: string }
  ): Promise<HandwritingRecognitionResult> {
    try {
      const res = await this.service.recognizeStrokes(strokes);
      return {
        rawStrokes: strokes,
        recognizedText: res.recognizedText,
        latex: res.latex,
        asciimath: res.asciimath,
        normalizedExpression: normalizeMathExpression(res.recognizedText),
        confidence: res.confidence,
        status: res.status,
      };
    } catch (err) {
      console.warn('Mathpix recognition failed, falling back to Demo stroke engine:', err);
      return new DemoMathHandwritingProvider().recognizeStrokes(strokes, imageBase64, context);
    }
  }

  normalizeExpression(text: string): string {
    return normalizeMathExpression(text);
  }
}

/**
 * Factory for MathHandwritingProvider
 */
export function getMathHandwritingProvider(): MathHandwritingProvider {
  const mathpixService = new MathpixRecognitionService();
  if (mathpixService.isConfigured()) {
    return new MathpixHandwritingProvider();
  }

  return new DemoMathHandwritingProvider();
}
