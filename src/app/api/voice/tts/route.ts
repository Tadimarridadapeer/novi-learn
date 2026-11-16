import { NextResponse } from 'next/server';
import { getTTSProvider } from '@/lib/ai/provider';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text string is required' }, { status: 400 });
    }

    const tts = getTTSProvider();
    const audioData = await tts.synthesizeSpeech(text);

    if (typeof audioData !== 'string' && audioData.byteLength > 0) {
      return new Response(audioData, {
        headers: {
          'Content-Type': 'audio/mpeg',
        },
      });
    }

    return NextResponse.json({
      success: true,
      text,
      provider: tts.name,
      note: 'Using browser SpeechSynthesis fallback on client side',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
