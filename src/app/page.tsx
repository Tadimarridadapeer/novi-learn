'use client';

import React from 'react';
import Link from 'next/link';
import { HeroDotsBackground } from '@/components/layout/HeroDotsBackground';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black selection:bg-brand-600 selection:text-white">
      {/* Hero Section with Floating Dots Background */}
      <section className="relative pt-24 pb-28 px-6 overflow-hidden border-b border-black/10">
        <HeroDotsBackground />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Subtle Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 border border-black/10 text-black text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand-600" />
            <span>Interactive AI Mathematics Tutor</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-black max-w-3xl mx-auto leading-[1.12]">
            Learn by talking, solving, and thinking.
          </h1>

          {/* Supporting Headline */}
          <p className="text-lg sm:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
            An interactive AI tutor that teaches mathematics with voice, real-time conversation, and a shared digital whiteboard.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-7 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Start Learning
            </Link>
            <a
              href="#preview"
              className="px-7 py-3.5 bg-white hover:bg-black/5 text-black font-semibold rounded-xl border border-black/20 transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Tutor Preview Section */}
      <section id="preview" className="py-16 px-6 bg-slate-50 border-b border-black/10 relative">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black">
              The Shared Digital Whiteboard Experience
            </h2>
            <p className="text-black/70 max-w-xl mx-auto text-sm sm:text-base">
              The AI tutor sits beside you—writing math steps, highlighting mistakes, and giving hints instead of giving away answers.
            </p>
          </div>

          {/* Interactive Workspace Preview Graphic (Minimalist White/Black/Burgundy) */}
          <div className="rounded-2xl border border-black/15 bg-white p-4 sm:p-6 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Whiteboard (Simulated ~70%) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-black/10 p-6 flex flex-col justify-between min-h-[320px] shadow-sm">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Whiteboard Surface</span>
                <span className="text-xs text-black/50 font-mono">Topic: Quadratic Equations</span>
              </div>
              
              <div className="my-auto space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-black/10 font-mono text-xl font-bold text-black">
                  x² + 5x + 6 = 0
                </div>
                <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 text-xs sm:text-sm font-medium">
                  <strong>Hint:</strong> What two numbers multiply to 6 and add up to 5?
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-black/50 pt-3 border-t border-black/10">
                <span>Controlled Action System</span>
                <span className="text-brand-700 font-semibold">State: HINTING</span>
              </div>
            </div>

            {/* AI Tutor Panel (Simulated ~30%) */}
            <div className="bg-slate-50 rounded-xl border border-black/10 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <div>
                  <div className="text-sm font-bold text-black">Novi Learn Tutor</div>
                  <div className="text-xs text-black/60">Guided Discovery Mode</div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-200">
                  Live
                </span>
              </div>

              <div className="my-4 space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-white border border-black/10 text-black">
                  Student: &quot;I tried 1 and 6.&quot;
                </div>
                <div className="p-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-950 leading-relaxed font-medium">
                  Tutor: &quot;1 and 6 multiply to 6, but add to 7! Look at the highlighted step on the board. What other factor pair of 6 works?&quot;
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-black/10 flex items-center justify-between">
                <div className="text-xs text-black/60 font-medium">
                  Voice Input Active
                </div>
                <Link
                  href="/tutor/new?topic=quadratic-equations"
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Try Session
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-black">How Novi Learn Teaches You</h2>
          <p className="text-black/70 text-base max-w-xl mx-auto">
            A pedagogical flow designed to build true comprehension rather than passive answer fetching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-black/10 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-extrabold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-black">Shared Whiteboard</h3>
            <p className="text-black/70 text-sm leading-relaxed">
              The AI controls the digital board—drawing functions, step boxes, equations, and highlighting mistake regions in real time.
            </p>
          </div>

          <div className="bg-white border border-black/10 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-extrabold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-black">Voice & Conversation</h3>
            <p className="text-black/70 text-sm leading-relaxed">
              Speak naturally or type your answer. The AI listens, evaluates mathematical accuracy deterministically, and adapts instantly.
            </p>
          </div>

          <div className="bg-white border border-black/10 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-extrabold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-black">No Given Answers</h3>
            <p className="text-black/70 text-sm leading-relaxed">
              When you make a mistake, Novi Learn highlights the error and asks guiding discovery questions to help you solve it yourself.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 bg-slate-50 border-t border-black/10 text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-black">Ready to master algebra?</h2>
        <p className="text-black/70 text-base max-w-xl mx-auto">
          Start your personalized mathematics session in seconds.
        </p>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-md"
          >
            Start Learning Now
          </Link>
        </div>
      </section>
    </div>
  );
}
