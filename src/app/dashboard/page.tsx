'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Sparkles, BookOpen, AlertTriangle, ArrowRight, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react';

interface SkillItem {
  id: string;
  title: string;
  slug: string;
  level: number;
  status: string;
  color: string;
  sessionsCount: number;
}

export default function StudentDashboard() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/progress')
      .then((res) => res.json())
      .then((data) => {
        if (data.skills) setSkills(data.skills);
        if (data.totalSessions !== undefined) setTotalSessions(data.totalSessions);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // For a brand new student with 0 sessions, all progress values start at 0%
  const displaySkills = skills.map((s) => ({
    ...s,
    level: totalSessions === 0 ? 0 : s.level,
  }));

  const activeTopic = displaySkills.find((s) => s.slug === 'quadratic-equations') || {
    title: 'Quadratic Equations',
    level: 0,
    slug: 'quadratic-equations',
  };

  const overallAvg = totalSessions === 0 ? 0 : Math.round(displaySkills.reduce((a, b) => a + b.level, 0) / (displaySkills.length || 1));

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-10 space-y-10">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Good morning, Student 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Ready to continue your 1-on-1 mathematics tutoring session?</p>
        </div>
        <Link
          href="/tutor/new?topic=quadratic-equations"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md inline-flex items-center gap-2 self-start"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Start Session</span>
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Active Learning & Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Current Learning Goal
              </span>
              <span className="text-xs text-slate-400 font-mono">Sessions: {totalSessions}</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">{activeTopic.title}</h2>
              <p className="text-slate-500 text-sm mt-1">
                Mastering factorisation method, greatest common factors, and roots.
              </p>
            </div>

            {/* Progress Bar (Starts at 0% for new student) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Topic Progress</span>
                <span className="text-brand-600 font-mono text-sm">{activeTopic.level}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-500"
                  style={{ width: `${activeTopic.level}%` }}
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="text-xs text-slate-500">Interactive 1-on-1 Whiteboard Workspace</div>
              <Link
                href={`/tutor/new?topic=${activeTopic.slug}`}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-md"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Learning Map Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-600" />
                Your Learning Map
              </h3>
              <Link href="/progress" className="text-xs font-bold text-brand-600 hover:underline">
                View detailed map →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                  <span>Overall Algebra</span>
                  <span className="text-brand-600 font-mono">{overallAvg}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full" style={{ width: `${overallAvg}%` }} />
                </div>
              </div>

              {displaySkills.map((skill) => (
                <div key={skill.title} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                    <span>{skill.title}</span>
                    <span className="text-slate-900 font-mono">{skill.level}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className={`h-full ${skill.level > 0 ? skill.color : 'bg-slate-300'} rounded-full`} style={{ width: `${skill.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Recommended & Weak Areas */}
        <div className="space-y-6">
          {/* Recommended Next Lesson */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Recommended Next Step
            </div>
            <h3 className="text-lg font-bold text-slate-900">Factorisation Practice</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Strengthen greatest common factor extraction and parentheses expansion.
            </p>
            <Link
              href="/tutor/new?topic=factorisation"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Factorisation Practice</span>
            </Link>
          </div>

          {/* Weak Areas Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Identified Focus Areas
            </h3>
            {totalSessions === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                No mistakes recorded yet. Complete your first session to track weak areas!
              </p>
            ) : (
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                  <span>Sign error handling in isolation</span>
                  <span className="text-amber-700 font-bold font-mono">1 mistake</span>
                </li>
                <li className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                  <span>Selecting c factor pairs</span>
                  <span className="text-amber-700 font-bold font-mono">1 mistake</span>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
