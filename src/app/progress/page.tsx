'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, TrendingUp, AlertTriangle, BookOpen, CheckCircle2, Play, RefreshCw, ArrowRight } from 'lucide-react';

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
    { id: '1', title: 'Linear Equations', slug: 'linear-equations', level: 84, status: 'Mastered', color: 'bg-emerald-500', sessionsCount: 3 },
    { id: '2', title: 'Graphs & Functions', slug: 'graphs-functions', level: 61, status: 'Proficient', color: 'bg-teal-500', sessionsCount: 2 },
    { id: '3', title: 'Factorisation', slug: 'factorisation', level: 58, status: 'Developing', color: 'bg-amber-500', sessionsCount: 4 },
    { id: '4', title: 'Quadratic Equations', slug: 'quadratic-equations', level: 42, status: 'Needs Practice', color: 'bg-brand-600', sessionsCount: 2 },
  ];

  const displaySkills = skills.length > 0 ? skills : defaultSkills;

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          Learning Map & Skill Progress
        </h1>
        <p className="text-slate-500 text-sm">
          Track your real-time mathematical mastery, confidence score, and mistake analytics across topics.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Updating real-time progress calculations...</p>
        </div>
      ) : (
        /* Main Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skill Breakdown (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-600" />
                  Algebra Skill Proficiency
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
                  Live Analytics
                </span>
              </div>

              <div className="space-y-5">
                {displaySkills.map((skill) => (
                  <div key={skill.title} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-slate-900 font-bold">{skill.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 font-medium">
                          {skill.status}
                        </span>
                        <span className="text-slate-900 font-mono text-base font-bold">{skill.level}%</span>
                      </div>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${skill.color} rounded-full transition-all duration-500`}
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{skill.sessionsCount} session(s) completed</span>
                      <Link
                        href={`/tutor/new?topic=${skill.slug}`}
                        className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
                      >
                        <span>Practice now</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Common Mistakes & Action Card (1 col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
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
                  <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{m.type}</span>
                      <span className="text-amber-700 font-mono font-bold">{m.count}x</span>
                    </div>
                    <div className="text-slate-600 flex items-center justify-between pt-0.5">
                      <span>{m.topic}</span>
                      <span className="text-slate-500 font-mono">{m.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-center space-y-4 text-white shadow-xl">
              <h4 className="text-base font-bold">Ready to boost your algebra score?</h4>
              <p className="text-xs text-brand-100 leading-relaxed">
                Targeted 1-on-1 session focused on your specific weak areas and factorisation rules.
              </p>
              <Link
                href="/tutor/new?topic=quadratic-equations"
                className="w-full py-3 bg-white hover:bg-slate-50 text-brand-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-brand-700" />
                <span>Start Practice Session</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
