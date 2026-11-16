'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowRight, Award, LayoutDashboard, Sparkles, RefreshCw } from 'lucide-react';

interface SummaryData {
  sessionId?: string;
  topicTitle: string;
  topicSlug: string;
  confidenceScore: number;
  confidenceDelta: string;
  accomplishments: string[];
  needsPractice: string[];
  recommendedNext: {
    title: string;
    slug: string;
  };
}

export default function SessionSummaryPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      try {
        const targetId = id || 'latest';
        const res = await fetch(`/api/sessions/${targetId}`);
        const data = await res.json();
        if (data.success && data.summary) {
          setSummary(data.summary);
        }
      } catch (err) {
        console.error('Failed to load summary:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto w-full px-6 py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
        <p className="text-slate-600 font-medium">Generating your personalized session summary...</p>
      </div>
    );
  }

  const topicTitle = summary?.topicTitle || 'Algebra Practice Session';
  const accomplishments = summary?.accomplishments || ['Completed step-by-step math problem solving'];
  const needsPractice = summary?.needsPractice || ['Reviewing negative sign placement'];
  const confScore = summary?.confidenceScore || 70;
  const confDelta = summary?.confidenceDelta || '+12%';
  const recommendedNext = summary?.recommendedNext || {
    title: 'Factorisation Practice',
    slug: 'factorisation',
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-12 space-y-8 animate-fadeIn">
      {/* Success Hero Badge */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <Award className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 px-3.5 py-1 bg-emerald-50 rounded-full border border-emerald-200 shadow-sm">
            Session Completed ✓
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mt-3">{topicTitle}</h1>
          <p className="text-slate-500 text-sm mt-1">Great job completing today&apos;s 1-on-1 tutoring loop!</p>
        </div>
      </div>

      {/* Dynamic Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6 shadow-xl">
        {/* Practice Accomplishments */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>You Practiced Today:</span>
          </h3>
          <ul className="space-y-2.5 text-sm text-slate-800">
            {accomplishments.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Needs Practice */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Needs More Practice:
          </h3>
          <ul className="space-y-2.5 text-sm text-slate-800">
            {needsPractice.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-slate-800">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Confidence Score Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">Topic Confidence Score</span>
            <span className="text-brand-600 font-mono text-base">{confScore}% ({confDelta})</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${confScore}%` }}
            />
          </div>
        </div>

        {/* Recommended Next Lesson */}
        <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-brand-700 font-bold uppercase tracking-wider">Recommended Next Step</div>
            <div className="text-sm font-bold text-slate-900">{recommendedNext.title}</div>
          </div>
          <Link
            href={`/tutor/new?topic=${recommendedNext.slug}`}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shrink-0"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 transition-colors flex items-center gap-2 shadow-sm"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <Link
          href="/topics"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2"
        >
          <span>Explore All Topics</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
