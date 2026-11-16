'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface SkillProficiency {
  id: string;
  title: string;
  slug: string;
  level: number;
  status: string;
  color: string;
  sessionsCount: number;
}

interface MistakeItem {
  type: string;
  topic: string;
  date: string;
  count: number;
}

export default function ProgressPage() {
  const [skills, setSkills] = useState<SkillProficiency[]>([]);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      setLoading(true);
      try {
        const res = await fetch('/api/progress');
        const data = await res.json();
        if (data.success) {
          if (data.skills) setSkills(data.skills);
          if (data.mistakesHistory) setMistakes(data.mistakesHistory);
        }
      } catch (err) {
        console.error('Failed to load progress data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, []);

  const defaultSkills: SkillProficiency[] = [
    { id: '1', title: 'Linear Equations', slug: 'linear-equations', level: 84, status: 'Mastered', color: 'bg-black', sessionsCount: 3 },
    { id: '2', title: 'Graphs & Functions', slug: 'graphs-functions', level: 61, status: 'Proficient', color: 'bg-black/80', sessionsCount: 2 },
    { id: '3', title: 'Factorisation', slug: 'factorisation', level: 58, status: 'Developing', color: 'bg-brand-600', sessionsCount: 4 },
    { id: '4', title: 'Quadratic Equations', slug: 'quadratic-equations', level: 42, status: 'Needs Practice', color: 'bg-brand-700', sessionsCount: 2 },
  ];

  const displaySkills = skills.length > 0 ? skills : defaultSkills;

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-10 space-y-10 bg-white text-black">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-black">
          Learning Map & Skill Progress
        </h1>
        <p className="text-black/60 text-sm">
          Track your real-time mathematical mastery, confidence score, and mistake analytics across topics.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-black/60 font-medium">Updating real-time progress calculations...</p>
        </div>
      ) : (
        /* Main Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skill Breakdown (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-black/10 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <h2 className="text-lg font-bold text-black">
                  Algebra Skill Proficiency
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-800 rounded-full border border-brand-200">
                  Live Analytics
                </span>
              </div>

              <div className="space-y-5">
                {displaySkills.map((skill) => (
                  <div key={skill.title} className="p-4 rounded-xl bg-slate-50 border border-black/10 space-y-2.5">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-black font-bold">{skill.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white text-black/70 border border-black/10 font-medium">
                          {skill.status}
                        </span>
                        <span className="text-black font-mono text-base font-bold">{skill.level}%</span>
                      </div>
                    </div>
                    <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden">
                      <div
                        className="h-full bg-brand-600 rounded-full transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-black/60 pt-1">
                      <span>{skill.sessionsCount} session(s) completed</span>
                      <Link
                        href={`/tutor/new?topic=${skill.slug}`}
                        className="text-brand-700 hover:text-brand-900 font-bold"
                      >
                        Practice now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Common Mistakes & Action Card (1 col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-black/10 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-black border-b border-black/10 pb-3">
                Mistake Analytics
              </h3>
              <div className="space-y-3">
                {(mistakes.length > 0
                  ? mistakes
                  : [
                      { type: 'Sign flip error', topic: 'Quadratic Roots', date: 'Today', count: 2 },
                      { type: 'Factor selection sum mismatch', topic: 'Factorisation', date: 'Yesterday', count: 3 },
                    ]
                ).map((m, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-black">
                      <span>{m.type}</span>
                      <span className="text-brand-800 font-mono font-bold">{m.count}x</span>
                    </div>
                    <div className="text-black/70 flex items-center justify-between pt-0.5">
                      <span>{m.topic}</span>
                      <span className="text-black/50 font-mono">{m.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-600 rounded-2xl p-6 text-center space-y-4 text-white shadow-md">
              <h4 className="text-base font-bold">Ready to boost your algebra score?</h4>
              <p className="text-xs text-white/80 leading-relaxed">
                Targeted 1-on-1 session focused on your specific weak areas and factorisation rules.
              </p>
              <Link
                href="/tutor/new?topic=quadratic-equations"
                className="w-full py-3 bg-white hover:bg-slate-100 text-brand-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center shadow-sm"
              >
                Start Practice Session
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
