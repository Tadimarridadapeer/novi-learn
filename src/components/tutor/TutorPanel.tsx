'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TutorState, TeachingStrategy } from '@/lib/tutor/types';
import katex from 'katex';

interface TutorPanelProps {
  tutorState: TutorState;
  teachingStrategy: TeachingStrategy;
  messages: { sender: 'STUDENT' | 'TUTOR' | 'SYSTEM'; text: string }[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  recognitionState?: {
    status: 'IDLE' | 'LISTENING' | 'RECOGNIZING' | 'RECOGNIZED' | 'LOW_CONFIDENCE' | 'FAILED';
    recognizedText: string;
    latex?: string;
    confidence: number;
  };
  onUpdateRecognizedText?: (text: string) => void;
}

export const TutorPanel: React.FC<TutorPanelProps> = ({
  tutorState,
  teachingStrategy,
  messages,
  onSendMessage,
  isLoading,
  recognitionState,
  onUpdateRecognizedText,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Manual Edit state for Recognized Answer Preview
  const [isEditingRecognized, setIsEditingRecognized] = useState(false);
  const [editedText, setEditedText] = useState('');

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync edited text with external recognition updates
  useEffect(() => {
    if (recognitionState?.recognizedText) {
      setEditedText(recognitionState.recognizedText);
    }
  }, [recognitionState?.recognizedText]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, tutorState]);

  // Speech-to-Text Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');

          setInputText(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Text-to-Speech Output whenever new TUTOR message arrives
  useEffect(() => {
    if (!audioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'TUTOR') {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lastMsg.text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, [messages, audioEnabled]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser environment. You can type your response!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputText('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSubmitRecognized = () => {
    const textToSend = editedText.trim() || recognitionState?.recognizedText?.trim() || '';
    if (!textToSend || isLoading) return;
    onSendMessage(textToSend);
    setIsEditingRecognized(false);
  };

  // Render KaTeX HTML safely for clean mathematical representation
  const renderMathContent = (text: string, latex?: string) => {
    try {
      const mathStr = latex || text;
      const html = katex.renderToString(mathStr, { throwOnError: false });
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (e) {
      return <span>{text}</span>;
    }
  };

  // State Status Indicator Badges
  const getStateBadge = () => {
    switch (tutorState) {
      case 'THINKING':
      case 'UNDERSTANDING':
      case 'EVALUATING':
        return { label: 'Evaluating Answer...', color: 'bg-black/5 text-black border-black/20' };
      case 'EXPLAINING':
      case 'QUESTIONING':
        return { label: 'Learning', color: 'bg-brand-50 text-brand-800 border-brand-200' };
      case 'HINTING':
      case 'CORRECTING':
        return { label: 'Needs Practice', color: 'bg-black/5 text-black border-black/20' };
      case 'SESSION_COMPLETE':
        return { label: 'Concept Mastered', color: 'bg-black text-white border-black' };
      default:
        return { label: 'Learning', color: 'bg-slate-100 text-black border-slate-200' };
    }
  };

  const stateBadge = getStateBadge();
  const currentStatus = recognitionState?.status || 'IDLE';
  const confPercent = Math.round((recognitionState?.confidence || 0.96) * 100);
  const hasRecognizedText = !!(recognitionState?.recognizedText || editedText);

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-black/10 shadow-lg overflow-hidden select-none">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between bg-slate-50/80">
        <div>
          <h3 className="text-sm font-extrabold text-black flex items-center gap-2">
            Novi Learn Tutor
            {isSpeaking && (
              <span className="flex items-center gap-1 text-[11px] text-brand-700 font-bold">
                [Speaking]
              </span>
            )}
          </h3>
          <p className="text-xs text-black/50">Strategy: {teachingStrategy.replace('_', ' ')}</p>
        </div>

        {/* Audio Toggle (Text based, no icons) */}
        <button
          onClick={() => {
            setAudioEnabled(!audioEnabled);
            if (audioEnabled) window.speechSynthesis?.cancel();
          }}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors border ${
            audioEnabled ? 'bg-white text-black border-black/15 hover:bg-black/5' : 'bg-black/5 text-black/40 border-black/10'
          }`}
          title={audioEnabled ? 'Voice Output Enabled' : 'Voice Output Muted'}
        >
          {audioEnabled ? 'Audio ON' : 'Audio OFF'}
        </button>
      </div>

      {/* State Status Indicator */}
      <div className="px-5 py-2.5 bg-slate-50/50 border-b border-black/10 flex items-center justify-between">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${stateBadge.color}`}>
          <span>{stateBadge.label}</span>
        </div>
        {isLoading && (
          <div className="text-xs text-black/50 animate-pulse font-medium">Evaluating answer...</div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-sm bg-slate-50/40">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'STUDENT' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                msg.sender === 'STUDENT'
                  ? 'bg-black text-white rounded-br-none shadow-sm'
                  : 'bg-white text-black border border-black/10 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="text-[11px] opacity-70 mb-1 font-bold tracking-wider uppercase">
                {msg.sender === 'STUDENT' ? 'You' : 'Novi Learn Tutor'}
              </div>
              <div className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* RECOGNIZED HANDWRITING ANSWER PREVIEW CARD */}
      {(currentStatus !== 'IDLE' || hasRecognizedText) && (
        <div className="mx-4 my-2 p-3.5 bg-brand-50 border border-brand-200 rounded-2xl space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-brand-900">
            <span>Recognized Answer</span>
            <div className="flex items-center gap-2">
              {currentStatus === 'LISTENING' && (
                <span className="text-[11px] text-brand-700 font-bold">
                  Listening to handwriting...
                </span>
              )}
              {currentStatus === 'RECOGNIZING' && (
                <span className="text-[11px] text-brand-700 font-bold">
                  Recognizing...
                </span>
              )}
              {currentStatus === 'RECOGNIZED' && confPercent >= 90 && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-900 border border-brand-300 font-bold">
                  {confPercent}% Recognized
                </span>
              )}
              {(currentStatus === 'LOW_CONFIDENCE' || (confPercent >= 70 && confPercent < 90)) && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-black/5 text-black border border-black/20 font-bold">
                  Please check your answer
                </span>
              )}
              {(currentStatus === 'FAILED' || confPercent < 70) && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-black/10 text-black border border-black/20 font-bold">
                  Could not read clearly
                </span>
              )}
            </div>
          </div>

          {/* Recognized Text Display / Edit Mode */}
          <div className="flex items-center justify-between gap-3">
            {isEditingRecognized ? (
              <input
                type="text"
                autoFocus
                value={editedText}
                onChange={(e) => {
                  setEditedText(e.target.value);
                  if (onUpdateRecognizedText) onUpdateRecognizedText(e.target.value);
                }}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingRecognized(false)}
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-brand-300 rounded-xl font-mono text-black font-bold focus:outline-none focus:border-brand-600"
              />
            ) : (
              <div className="font-mono text-base font-bold text-black tracking-wide px-1">
                {renderMathContent(editedText || '...', recognitionState?.latex)}
              </div>
            )}

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsEditingRecognized(!isEditingRecognized)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-black text-xs font-semibold rounded-lg border border-black/15 transition-colors"
                title="Edit recognized text"
              >
                {isEditingRecognized ? 'Done' : 'Edit'}
              </button>
              <button
                onClick={handleSubmitRecognized}
                disabled={!editedText.trim() || isLoading}
                className="px-3 py-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Voice & Text Input Bar */}
      <div className="p-4 bg-white border-t border-black/10 flex flex-col gap-3">
        {/* Voice Listening Bar */}
        {isListening && (
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-200 rounded-xl text-brand-900 text-xs font-bold animate-pulse">
            <span>Listening... Speak your answer now.</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Microphone Hold / Speak Button (Text based, zero icons) */}
          <button
            onClick={toggleListening}
            className={`px-3 py-2.5 rounded-xl transition-all border flex items-center justify-center text-xs font-bold ${
              isListening
                ? 'bg-brand-600 text-white border-brand-700 shadow-sm animate-pulse'
                : 'bg-slate-100 text-black border-black/10 hover:bg-slate-200'
            }`}
            title={isListening ? 'Click to stop listening' : 'Click to speak'}
          >
            {isListening ? 'Mute' : 'Voice'}
          </button>

          {/* Text Input Box */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your answer (or write on whiteboard)..."
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder-black/40 focus:outline-none focus:border-brand-600 transition-colors"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
            title="Send Answer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
