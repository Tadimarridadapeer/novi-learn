export interface LLMProvider {
  name: string;
  generateResponse(prompt: string, context?: any): Promise<string>;
  callTools?(prompt: string, tools: any[]): Promise<{ toolName: string; args: any }>;
}

export interface SpeechToTextProvider {
  name: string;
  transcribeAudio(audioBlob: Blob | Buffer): Promise<string>;
}

export interface TextToSpeechProvider {
  name: string;
  synthesizeSpeech(text: string): Promise<ArrayBuffer | string>;
}

/**
 * Demo Mock LLM Provider
 */
export class DemoLLMProvider implements LLMProvider {
  name = 'Demo Provider (Offline/Local)';

  async generateResponse(prompt: string, context?: any): Promise<string> {
    return `[Demo Tutor] I evaluated: "${prompt}". Let us continue working through the problem step-by-step.`;
  }
}

/**
 * Gemini LLM Provider
 */
export class GeminiLLMProvider implements LLMProvider {
  name = 'Google Gemini AI';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const ai = new GoogleGenerativeAI(this.apiKey);
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent(prompt);
      return response.response.text() || 'No response text returned.';
    } catch (err: any) {
      console.warn('Gemini Provider fallback to demo mode:', err.message);
      return new DemoLLMProvider().generateResponse(prompt, context);
    }
  }
}

/**
 * Speech-To-Text Provider utilizing STT_API_KEY
 */
export class ActiveSpeechToTextProvider implements SpeechToTextProvider {
  name = 'Cloud Speech-To-Text Provider';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeAudio(audioBlob: Blob | Buffer): Promise<string> {
    try {
      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'audio/wav',
        },
        body: audioBlob as any,
      });

      if (response.ok) {
        const data = await response.json();
        return data.results?.channels[0]?.alternatives[0]?.transcript || '';
      }
    } catch (e) {
      console.warn('STT API Provider fallback:', e);
    }
    return '';
  }
}

/**
 * Text-To-Speech Provider utilizing TTS_API_KEY
 */
export class ActiveTextToSpeechProvider implements TextToSpeechProvider {
  name = 'ElevenLabs Text-To-Speech Provider';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesizeSpeech(text: string): Promise<ArrayBuffer | string> {
    try {
      // ElevenLabs API integration using voice Rachel (21m00Tcm4TlvDq8ikWAM)
      const voiceId = '21m00Tcm4TlvDq8ikWAM';
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (response.ok) {
        return await response.arrayBuffer();
      } else {
        console.warn('ElevenLabs API returned error status:', response.status);
      }
    } catch (e) {
      console.warn('ElevenLabs TTS API Provider fallback:', e);
    }
    return '';
  }
}

/**
 * Factory for active LLM Provider
 */
export function getLLMProvider(): LLMProvider {
  const providerType = process.env.AI_PROVIDER || 'demo';
  const geminiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;

  if (providerType === 'gemini' && geminiKey) {
    return new GeminiLLMProvider(geminiKey);
  }

  return new DemoLLMProvider();
}

/**
 * Factory for active STT Provider
 */
export function getSTTProvider(): SpeechToTextProvider {
  const sttKey = process.env.STT_API_KEY;
  if (sttKey) {
    return new ActiveSpeechToTextProvider(sttKey);
  }
  return {
    name: 'Browser WebSpeech STT Fallback',
    transcribeAudio: async () => '',
  };
}

/**
 * Factory for active TTS Provider
 */
export function getTTSProvider(): TextToSpeechProvider {
  const ttsKey = process.env.TTS_API_KEY;
  if (ttsKey) {
    return new ActiveTextToSpeechProvider(ttsKey);
  }
  return {
    name: 'Browser WebSpeech TTS Fallback',
    synthesizeSpeech: async () => '',
  };
}
