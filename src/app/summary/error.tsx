'use client';

import React from 'react';
import Link from 'next/link';

export default function SummaryError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Session Completed ✓</h2>
      <p className="text-slate-400 text-sm max-w-md">
        Your tutoring metrics have been saved to your student dashboard.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
