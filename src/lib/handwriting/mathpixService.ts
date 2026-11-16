export interface MathpixStrokePayload {
  strokes: {
    x: number[][];
    y: number[][];
  };
  formats: string[];
}

export interface MathpixNormalizedResult {
  recognizedText: string;
  latex: string;
  asciimath: string;
  confidence: number;
  status: 'RECOGNIZED' | 'LOW_CONFIDENCE' | 'FAILED';
}

/**
 * Server-Side Mathpix OCR API Service (v3/strokes)
 * Keeps MATHPIX_APP_ID & MATHPIX_APP_KEY strictly isolated on the backend.
 */
export class MathpixRecognitionService {
  private appId: string;
  private appKey: string;

  constructor() {
    this.appId = process.env.MATHPIX_APP_ID || '';
    this.appKey = process.env.MATHPIX_APP_KEY || '';
  }

  public isConfigured(): boolean {
    return !!(this.appId && this.appKey);
  }

  /**
   * Convert LaTeX string into clean student-facing math text
   */
  public static cleanLatexToText(latexStr: string): string {
    if (!latexStr) return '';
    return latexStr
      .replace(/\\left\(/g, '(')
      .replace(/\\right\)/g, ')')
      .replace(/\\left\[/g, '[')
      .replace(/\\right\]/g, ']')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\cdot/g, '·')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\sqrt\{([^}]+)\}/g, '√$1')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
      .replace(/\{/g, '')
      .replace(/\}/g, '')
      .replace(/\\/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Send digital ink stroke coordinates to Mathpix /v3/strokes
   */
  public async recognizeStrokes(strokes: any[]): Promise<MathpixNormalizedResult> {
    if (!this.isConfigured()) {
      throw new Error('MATHPIX_APP_ID or MATHPIX_APP_KEY not configured on server');
    }

    if (!strokes || strokes.length === 0) {
      return {
        recognizedText: '',
        latex: '',
        asciimath: '',
        confidence: 0,
        status: 'FAILED',
      };
    }

    // Format digital ink strokes for Mathpix v3/strokes
    const formattedStrokes: MathpixStrokePayload = {
      strokes: {
        x: strokes.map((s) => (s.points || []).map((p: any) => Math.round(p.x))),
        y: strokes.map((s) => (s.points || []).map((p: any) => Math.round(p.y))),
      },
      formats: ['text', 'latex_styled', 'asciimath'],
    };

    try {
      const response = await fetch('https://api.mathpix.com/v3/strokes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'app_id': this.appId,
          'app_key': this.appKey,
        },
        body: JSON.stringify(formattedStrokes),
      });

      if (!response.ok) {
        console.warn(`Mathpix API returned error status: ${response.status}`);
        throw new Error(`Mathpix API returned status ${response.status}`);
      }

      const data = await response.json();
      const rawLatex = data.latex_styled || data.text || '';
      const asciimath = data.asciimath || '';
      const confidence = data.confidence_rate ?? data.confidence ?? 0.95;

      const recognizedText = MathpixRecognitionService.cleanLatexToText(rawLatex) || asciimath || data.text || '';

      let status: 'RECOGNIZED' | 'LOW_CONFIDENCE' | 'FAILED' = 'RECOGNIZED';
      if (confidence < 0.7) status = 'FAILED';
      else if (confidence < 0.9) status = 'LOW_CONFIDENCE';

      return {
        recognizedText,
        latex: rawLatex,
        asciimath,
        confidence,
        status,
      };
    } catch (err: any) {
      console.error('Mathpix API recognition failed:', err);
      throw err;
    }
  }
}
