'use client';

import React from 'react';
import Link from 'next/link';
import { Mic, Sparkles, BookOpen, Brain, CheckCircle2, ArrowRight, Play, Presentation, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-400" />
            <span>Interactive AI Mathematics Tutor</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-100 max-w-3xl mx-auto leading-[1.15]">
            Learn by talking, solving, and thinking.
          </h1>

          {/* Supporting Headline */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            An interactive AI tutor that teaches mathematics with voice, real-time conversation, and a shared digital whiteboard.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-brand-600/25 flex items-center gap-2"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#preview"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-800 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-400 text-slate-400" />
              <span>See how it works</span>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Tutor Preview Section */}
      <section id="preview" className="py-12 px-6 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              The Shared Digital Whiteboard Experience
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              The AI tutor sits beside you—writing math steps, highlighting mistakes, and giving hints instead of giving away answers.
            </p>
          </div>

          {/* Interactive Workspace Preview Graphic */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Whiteboard (Simulated ~70%) */}
            <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col justify-between min-h-[320px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">Whiteboard Surface</span>
                <span className="text-xs text-slate-500">Topic: Quadratic Equations</span>
              </div>
              
              <div className="my-auto space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-lg text-slate-100">
                  x² + 5x + 6 = 0
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm">
                  💡 <strong>Hint:</strong> What two numbers multiply to 6 and add up to 5?
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800">
                <span>Controlled Action System</span>
                <span className="text-brand-400 font-medium">State: HINTING</span>
              </div>
            </div>

            {/* AI Tutor Panel (Simulated ~30%) */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">Novi Learn Tutor</div>
                  <div className="text-xs text-slate-400">Guided Discovery Mode</div>
                </div>
              </div>

              <div className="my-4 space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-800 text-slate-300">
                  Student: &quot;I tried 1 and 6.&quot;
                </div>
                <div className="p-3 rounded-lg bg-brand-950/60 border border-brand-800/60 text-slate-200 leading-relaxed">
                  Tutor: &quot;1 and 6 multiply to 6, but add to 7! Look at the highlighted step on the board. What other factor pair of 6 works?&quot;
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Mic className="w-4 h-4 text-brand-400" />
                  <span>Hold to Speak</span>
                </div>
                <Link
                  href="/tutor/new?topic=quadratic-equations"
                  className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-500 transition-colors"
                >
                  Try Interactive Session
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-slate-100">How Novi Learn Teaches You</h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            A pedagogical flow designed to build true comprehension rather than passive answer fetching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Shared Whiteboard</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              The AI controls the digital board—drawing functions, step boxes, equations, and highlighting mistake regions in real time.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Voice & Conversation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Speak naturally or type your answer. The AI listens, evaluates mathematical accuracy deterministically, and adapts instantly.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold text-slate-100">No Given Answers</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              When you make a mistake, Novi Learn highlights the error and asks guiding discovery questions to help you solve it yourself.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 bg-slate-900 border-t border-slate-800 text-center space-y-6">
        <h2 className="text-3xl font-bold text-slate-100">Ready to master algebra?</h2>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Start your personalized mathematics session in seconds.
        </p>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-brand-600/25"
          >
            <span>Start Learning Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
