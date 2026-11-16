import { NextResponse } from 'next/server';
import { getMathHandwritingProvider } from '@/lib/handwriting/provider';

export async function POST(request: Request) {
  try {
    const { sessionId, strokes, imageBase64, topicSlug } = await request.json();

    if ((!strokes || strokes.length === 0) && !imageBase64) {
      return NextResponse.json({
        success: true,
        result: {
          recognizedText: '',
          latex: '',
          asciimath: '',
          normalizedExpression: '',
          confidence: 0,
          status: 'FAILED',
        },
      });
    }

    const provider = getMathHandwritingProvider();
    const result = await provider.recognizeStrokes(strokes || [], imageBase64, { topicSlug });

    return NextResponse.json({
      success: true,
      result: {
        rawStrokes: strokes || [],
        recognizedText: result.recognizedText,
        latex: result.latex || result.recognizedText,
        asciimath: result.asciimath || result.recognizedText,
        normalizedExpression: result.normalizedExpression,
        confidence: result.confidence,
        status: result.status,
      },
    });
  } catch (err: any) {
    console.error('Whiteboard recognition error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        result: {
          recognizedText: '',
          latex: '',
          asciimath: '',
          normalizedExpression: '',
          confidence: 0,
          status: 'FAILED',
        },
      },
      { status: 500 }
    );
  }
}
