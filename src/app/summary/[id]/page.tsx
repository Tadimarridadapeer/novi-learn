'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
      <div className="max-w-3xl mx-auto w-full px-6 py-20 text-center space-y-4 bg-white text-black">
        <p className="text-black/60 font-medium">Generating your personalized session summary...</p>
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
    <div className="max-w-3xl mx-auto w-full px-6 py-12 space-y-8 bg-white text-black">
      {/* Success Hero Badge */}
      <div className="text-center space-y-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-800 px-3.5 py-1 bg-brand-50 rounded-full border border-brand-200">
            Session Completed
          </span>
          <h1 className="text-3xl font-extrabold text-black mt-3">{topicTitle}</h1>
          <p className="text-black/60 text-sm mt-1">Great job completing today&apos;s 1-on-1 tutoring loop!</p>
        </div>
      </div>

      {/* Dynamic Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-black/10 space-y-6 shadow-sm">
        {/* Practice Accomplishments */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/60">
            You Practiced Today:
          </h3>
          <ul className="space-y-2.5 text-sm text-black">
            {accomplishments.map((item, idx) => (
              <li key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-black/10 font-medium">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Needs Practice */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-700">
            Needs More Practice:
          </h3>
          <ul className="space-y-2.5 text-sm text-black">
            {needsPractice.map((item, idx) => (
              <li key={idx} className="p-3.5 rounded-xl bg-brand-50 border border-brand-200">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Confidence Score Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-black/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-black/80">Topic Confidence Score</span>
            <span className="text-brand-700 font-mono text-base">{confScore}% ({confDelta})</span>
          </div>
          <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${confScore}%` }}
            />
          </div>
        </div>

        {/* Recommended Next Lesson */}
        <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-brand-800 font-bold uppercase tracking-wider">Recommended Next Step</div>
            <div className="text-sm font-bold text-black">{recommendedNext.title}</div>
          </div>
          <Link
            href={`/tutor/new?topic=${recommendedNext.slug}`}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shrink-0"
          >
            Continue Learning
          </Link>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-white hover:bg-black/5 text-black rounded-xl text-sm font-semibold border border-black/15 transition-colors shadow-sm"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/topics"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          Explore All Topics
        </Link>
      </div>
    </div>
  );
}
