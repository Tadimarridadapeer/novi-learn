import { NextResponse } from 'next/server';
import { getSTTProvider } from '@/lib/ai/provider';

export async function POST(request: Request) {
  try {
    const audioBuffer = await request.arrayBuffer();
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'Empty audio buffer received' }, { status: 400 });
    }

    const stt = getSTTProvider();
    const transcript = await stt.transcribeAudio(Buffer.from(audioBuffer));

    return NextResponse.json({
      success: true,
      transcript,
      provider: stt.name,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
