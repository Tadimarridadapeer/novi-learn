'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TutorState, TeachingStrategy } from '@/lib/tutor/types';
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, Brain, CheckCircle, HelpCircle, BookOpen, Edit3, Loader2, AlertCircle } from 'lucide-react';
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
        return { label: 'Evaluating Answer...', icon: Brain, color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'EXPLAINING':
      case 'QUESTIONING':
        return { label: 'Learning', icon: BookOpen, color: 'bg-brand-50 text-brand-700 border-brand-200' };
      case 'HINTING':
      case 'CORRECTING':
        return { label: 'Needs Practice', icon: HelpCircle, color: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'SESSION_COMPLETE':
        return { label: 'Concept Mastered ✓', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Learning', icon: Sparkles, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const stateBadge = getStateBadge();
  const BadgeIcon = stateBadge.icon;

  const currentStatus = recognitionState?.status || 'IDLE';
  const confPercent = Math.round((recognitionState?.confidence || 0.96) * 100);
  const hasRecognizedText = !!(recognitionState?.recognizedText || editedText);

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden select-none">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-600">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Novi Learn Tutor
              {isSpeaking && (
                <span className="flex items-center gap-1 text-[11px] text-brand-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
                  Speaking
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">Strategy: {teachingStrategy.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            setAudioEnabled(!audioEnabled);
            if (audioEnabled) window.speechSynthesis?.cancel();
          }}
          className={`p-2 rounded-xl transition-colors border ${
            audioEnabled ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100' : 'bg-red-50 text-red-600 border-red-200'
          }`}
          title={audioEnabled ? 'Voice Output Enabled' : 'Voice Output Muted'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* State Status Indicator */}
      <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${stateBadge.color}`}>
          <BadgeIcon className="w-3.5 h-3.5" />
          <span>{stateBadge.label}</span>
        </div>
        {isLoading && (
          <div className="text-xs text-slate-500 animate-pulse font-medium">Evaluating answer...</div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-sm bg-slate-50/30">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'STUDENT' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                msg.sender === 'STUDENT'
                  ? 'bg-brand-600 text-white rounded-br-none shadow-md'
                  : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="text-[11px] opacity-75 mb-1 font-semibold tracking-wide uppercase">
                {msg.sender === 'STUDENT' ? 'You' : 'Novi Learn Tutor'}
              </div>
              <div className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* RECOGNIZED HANDWRITING ANSWER PREVIEW CARD (Mathpix / Ink Recognition) */}
      {(currentStatus !== 'IDLE' || hasRecognizedText) && (
        <div className="mx-4 my-2 p-3.5 bg-brand-50/70 border border-brand-200 rounded-2xl space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-brand-900">
            <span className="flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-brand-600" />
              <span>Recognized Answer</span>
            </span>
            <div className="flex items-center gap-2">
              {currentStatus === 'LISTENING' && (
                <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Listening to handwriting...
                </span>
              )}
              {currentStatus === 'RECOGNIZING' && (
                <span className="text-[11px] text-brand-600 font-semibold flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Recognizing...
                </span>
              )}
              {currentStatus === 'RECOGNIZED' && confPercent >= 90 && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                  {confPercent}% Recognized ✓
                </span>
              )}
              {(currentStatus === 'LOW_CONFIDENCE' || (confPercent >= 70 && confPercent < 90)) && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Please check your answer
                </span>
              )}
              {(currentStatus === 'FAILED' || confPercent < 70) && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  Couldn&apos;t read clearly
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
                className="flex-1 px-3 py-1.5 text-sm bg-white border border-brand-300 rounded-xl font-mono text-slate-900 font-bold focus:outline-none focus:border-brand-500"
              />
            ) : (
              <div className="font-mono text-base font-bold text-slate-900 tracking-wide px-1">
                {renderMathContent(editedText || '...', recognitionState?.latex)}
              </div>
            )}

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsEditingRecognized(!isEditingRecognized)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                title="Edit recognized text"
              >
                {isEditingRecognized ? 'Done' : 'Edit'}
              </button>
              <button
                onClick={handleSubmitRecognized}
                disabled={!editedText.trim() || isLoading}
                className="px-3 py-1 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Voice & Text Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-3">
        {/* Voice Listening Bar */}
        {isListening && (
          <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Listening... Speak your answer now.</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Microphone Hold / Speak Button */}
          <button
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all border flex items-center justify-center ${
              isListening
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30 animate-pulse'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title={isListening ? 'Click to stop listening' : 'Hold / Click to speak'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input Box */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your answer (or write on whiteboard)..."
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-colors"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl transition-colors shadow-md"
            title="Send Answer"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
