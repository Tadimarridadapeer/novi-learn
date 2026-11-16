'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center space-y-6">
      <div className="text-4xl font-bold text-slate-200">Tutoring Session Saved ✓</div>
      <p className="text-slate-400 text-sm max-w-md">
        Your tutoring metrics and progress have been recorded into your student profile.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold"
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-slate-800 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
