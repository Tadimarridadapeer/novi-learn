'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';
import { TutorPanel } from '@/components/tutor/TutorPanel';
import { WhiteboardCommand, TutorState, TeachingStrategy } from '@/lib/tutor/types';
import { LogOut, Sparkles } from 'lucide-react';

function TutorWorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topicSlug = searchParams?.get('topic') || 'quadratic-equations';

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [topicTitle, setTopicTitle] = useState('Quadratic Equations');
  const [tutorState, setTutorState] = useState<TutorState>('GREETING');
  const [strategy, setStrategy] = useState<TeachingStrategy>('GUIDED_DISCOVERY');
  const [whiteboardCommands, setWhiteboardCommands] = useState<WhiteboardCommand[]>([]);
  const [messages, setMessages] = useState<{ sender: 'STUDENT' | 'TUTOR' | 'SYSTEM'; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Live Automatic Recognition State
  const [recognitionState, setRecognitionState] = useState<{
    status: 'IDLE' | 'LISTENING' | 'RECOGNIZING' | 'RECOGNIZED' | 'LOW_CONFIDENCE' | 'FAILED';
    recognizedText: string;
    confidence: number;
  }>({
    status: 'IDLE',
    recognizedText: '',
    confidence: 0,
  });

  // Initialize Tutoring Session on mount
  useEffect(() => {
    async function initSession() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicSlug }),
        });
        const data = await res.json();
        if (data.success && data.session) {
          setSessionId(data.session.id);
          setTopicTitle(data.session.topicTitle);
          setTutorState(data.session.currentState);
          setStrategy(data.session.currentStrategy);
          setWhiteboardCommands(data.session.whiteboardCommands || []);
          setMessages([
            { sender: 'TUTOR', text: data.session.textResponse },
          ]);
        }
      } catch (err) {
        console.error('Failed to start session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, [topicSlug]);

  const handleRecognitionUpdate = useCallback(
    (update: {
      status: 'IDLE' | 'LISTENING' | 'RECOGNIZING' | 'RECOGNIZED' | 'LOW_CONFIDENCE' | 'FAILED';
      recognizedText: string;
      confidence: number;
    }) => {
      setRecognitionState(update);
    },
    []
  );

  const handleUpdateRecognizedText = (newText: string) => {
    setRecognitionState((prev) => ({
      ...prev,
      recognizedText: newText,
    }));
  };

  // Handle Student Input (Voice, Text, or Submitted Handwriting Recognition)
  const handleSendMessage = async (input: string) => {
    if (!sessionId || isLoading) return;

    // 1. Instantly append EXACT student message to UI (NO DUPLICATE CHAT MESSAGES)
    const updatedMessages = [...messages, { sender: 'STUDENT' as const, text: input }];
    setMessages(updatedMessages);
    setTutorState('THINKING');
    setIsLoading(true);

    // Reset live recognition state after submission
    setRecognitionState({ status: 'IDLE', recognizedText: '', confidence: 0 });

    try {
      // 2. Call API route to evaluate answer with Math Verifier & State Machine
      const res = await fetch(`/api/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentInput: input }),
      });
      const data = await res.json();

      if (data.success && data.tutorResponse) {
        const resp = data.tutorResponse;
        setTutorState(resp.state);
        setStrategy(resp.strategy);

        // Update conversation with Tutor evaluation response
        setMessages((prev) => [
          ...prev,
          { sender: 'TUTOR', text: resp.textResponse },
        ]);

        // Merge new whiteboard commands
        if (resp.whiteboardCommands && resp.whiteboardCommands.length > 0) {
          setWhiteboardCommands((prev) => [...prev, ...resp.whiteboardCommands]);
        }

        // If session is completed, navigate to Summary page after brief delay
        if (resp.state === 'SESSION_COMPLETE') {
          setTimeout(() => {
            router.push(`/summary/${encodeURIComponent((sessionId || 'completed').trim())}`);
          }, 3500);
        }
      }
    } catch (err) {
      console.error('Failed to process message:', err);
      setTutorState('QUESTIONING');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Session Workspace Bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {topicTitle}
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-semibold">
                1-on-1 Session
              </span>
            </h2>
          </div>
        </div>

        {/* Exit Session Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Workspace</span>
        </button>
      </header>

      {/* Main Workspace Split (Desktop: 70% Whiteboard | 30% AI Tutor Panel) */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 p-4 gap-4 overflow-hidden">
        {/* Whiteboard Surface (~70% = 8 columns out of 12) */}
        <div className="lg:col-span-8 h-full min-h-[350px]">
          <WhiteboardCanvas
            commands={whiteboardCommands}
            topicSlug={topicSlug}
            onRecognitionUpdate={handleRecognitionUpdate}
            onSubmitWhiteboardAnswer={(answerText) => handleSendMessage(answerText)}
            isAiWriting={tutorState === 'THINKING' || tutorState === 'EXPLAINING'}
          />
        </div>

        {/* AI Tutor Panel (~30% = 4 columns out of 12) */}
        <div className="lg:col-span-4 h-full min-h-[350px]">
          <TutorPanel
            tutorState={tutorState}
            teachingStrategy={strategy}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            recognitionState={recognitionState}
            onUpdateRecognizedText={handleUpdateRecognizedText}
          />
        </div>
      </main>
    </div>
  );
}

export default function TutorWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Novi Learn Workspace...</div>}>
      <TutorWorkspaceContent />
    </Suspense>
  );
}
