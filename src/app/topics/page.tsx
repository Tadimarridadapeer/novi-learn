'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
    <div className="max-w-5xl mx-auto w-full px-6 py-10 space-y-8 bg-white text-black">
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-black/60">
          <span>Mathematics</span>
          <span>/</span>
          <span className="text-brand-700">Algebra</span>
        </div>
        <h1 className="text-3xl font-extrabold text-black">Select Mathematics Topic</h1>
        <p className="text-black/60 text-sm">
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
              className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between space-y-5 shadow-sm relative ${
                topic.recommended
                  ? 'border-brand-600 shadow-brand-50'
                  : 'border-black/10 hover:border-black/20'
              }`}
            >
              {topic.recommended && (
                <div className="absolute -top-3 right-6 px-3 py-1 bg-brand-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                  Recommended
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-black/5 text-black border border-black/10">
                    {topic.difficulty}
                  </span>
                  <div className="text-xs text-black/60 font-mono">
                    <span>{topic.estDuration} mins</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-black">{topic.title}</h3>
                <p className="text-black/70 text-xs leading-relaxed">{topic.description}</p>
              </div>

              {/* Progress & Actions */}
              <div className="space-y-4 pt-4 border-t border-black/10">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-black/60">Mastery Level</span>
                    <span className="text-black font-mono font-bold">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-black/50">
                    Last studied: {topic.lastStudied || 'Recently'}
                  </span>
                  <Link
                    href={`/tutor/new?topic=${topic.slug}`}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Start Session
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
