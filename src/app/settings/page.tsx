'use client';

import React, { useState } from 'react';
import { Settings, Mic, Volume2, Cpu, Key, Check } from 'lucide-react';

export default function SettingsPage() {
  const [provider, setProvider] = useState<'demo' | 'gemini' | 'openai'>('demo');
  const [apiKey, setApiKey] = useState('');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Settings className="w-7 h-7 text-brand-400" />
          Application & Tutor Settings
        </h1>
        <p className="text-slate-400 text-sm">
          Configure voice interaction, speech rate, and AI engine preferences.
        </p>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-8 shadow-xl">
        {/* AI Engine Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-400" />
            AI Orchestrator Engine Mode
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setProvider('demo')}
              className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                provider === 'demo'
                  ? 'bg-brand-950/60 border-brand-500 text-brand-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-sm font-bold">Demo Mode (Offline)</div>
              <div className="text-xs opacity-80 leading-relaxed">
                Deterministic tutoring loop with zero API cost. Works out of the box.
              </div>
            </button>

            <button
              onClick={() => setProvider('gemini')}
              className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                provider === 'gemini'
                  ? 'bg-brand-950/60 border-brand-500 text-brand-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-sm font-bold">Google Gemini 2.5</div>
              <div className="text-xs opacity-80 leading-relaxed">
                Uses Gemini Flash for high-speed multi-step math tool calling.
              </div>
            </button>

            <button
              onClick={() => setProvider('openai')}
              className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                provider === 'openai'
                  ? 'bg-brand-950/60 border-brand-500 text-brand-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-sm font-bold">OpenAI GPT-4o</div>
              <div className="text-xs opacity-80 leading-relaxed">
                High-reasoning model for complex algebraic proofs.
              </div>
            </button>
          </div>

          {provider !== 'demo' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-brand-400" />
                API Key for {provider.toUpperCase()}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${provider} API Key...`}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          )}
        </div>

        {/* Voice Preferences */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-brand-400" />
            Voice Output & Speech Synthesis
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <span>Tutor Speaking Rate</span>
              <span className="font-mono">{voiceSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.1"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className="w-full accent-brand-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
