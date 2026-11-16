import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center space-y-6">
      <div className="text-6xl font-bold text-brand-400">404</div>
      <h2 className="text-2xl font-bold text-slate-100">Page or Session Not Found</h2>
      <p className="text-slate-400 text-sm max-w-md">
        The requested page or tutoring session session ID does not exist or has ended.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Go to Dashboard</span>
        </Link>
        <Link
          href="/topics"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold border border-slate-800 flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>Explore Topics</span>
        </Link>
      </div>
    </div>
  );
}
