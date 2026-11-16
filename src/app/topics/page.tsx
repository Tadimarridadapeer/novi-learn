'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Play, Sparkles, CheckCircle2, ChevronRight, Award } from 'lucide-react';

export default function TopicSelectionPage() {
  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/topics')
      .then((res) => res.json())
      .then((data) => {
        if (data.topics) setTopics(data.topics);
      })
      .catch((err) => console.error(err));
  }, []);

  const fallbackTopics = [
    {
      id: 'top_1',
      title: 'Linear Equations',
      slug: 'linear-equations',
      category: 'Algebra',
      difficulty: 'Beginner',
      estDuration: 15,
      description: 'Solving 1-variable linear equations like 2x + 6 = 14 and isolating variables.',
      proficiency: 0.84,
      lastStudied: 'Yesterday',
    },
    {
      id: 'top_2',
      title: 'Factorisation',
      slug: 'factorisation',
      category: 'Algebra',
      difficulty: 'Intermediate',
      estDuration: 20,
      description: 'Factoring algebraic expressions, common factors, grouping, and difference of squares.',
      proficiency: 0.54,
      lastStudied: '3 days ago',
    },
    {
      id: 'top_3',
      title: 'Quadratic Equations',
      slug: 'quadratic-equations',
      category: 'Algebra',
      difficulty: 'Intermediate',
      estDuration: 25,
      description: 'Solving x² + bx + c = 0 using zero-product property, roots, and graphing.',
      proficiency: 0.37,
      recommended: true,
      lastStudied: 'Today',
    },
    {
      id: 'top_4',
      title: 'Graphs & Functions',
      slug: 'graphs-functions',
      category: 'Algebra',
      difficulty: 'Intermediate',
      estDuration: 20,
      description: 'Plotting linear and quadratic curves, identifying x-intercepts, y-intercepts, and vertex.',
      proficiency: 0.61,
      lastStudied: '4 days ago',
    },
  ];

  const list = topics.length > 0 ? topics : fallbackTopics;

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-10 space-y-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>Mathematics</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-400">Algebra</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Select Mathematics Topic</h1>
        <p className="text-slate-400 text-sm">
          Choose a topic to begin a 1-to-1 voice & whiteboard tutoring session with Novi Learn.
        </p>
      </div>

      {/* Topics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.map((topic) => {
          const pct = Math.round((topic.proficiency || 0.5) * 100);
          return (
            <div
              key={topic.slug}
              className={`bg-slate-900 rounded-2xl p-6 border transition-all flex flex-col justify-between space-y-5 shadow-lg relative ${
                topic.recommended
                  ? 'border-brand-500/80 shadow-brand-900/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {topic.recommended && (
                <div className="absolute -top-3 right-6 px-3 py-1 bg-brand-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-md">
                  ★ Recommended
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {topic.difficulty}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{topic.estDuration} mins</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-100">{topic.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{topic.description}</p>
              </div>

              {/* Progress & Actions */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-400">Mastery Level</span>
                    <span className="text-slate-200 font-mono">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Last studied: {topic.lastStudied || 'Recently'}
                  </span>
                  <Link
                    href={`/tutor/new?topic=${topic.slug}`}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Session</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
