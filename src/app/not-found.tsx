import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-6 text-center space-y-6">
      <div className="text-6xl font-extrabold text-brand-600">404</div>
      <h2 className="text-2xl font-bold text-black">Page or Session Not Found</h2>
      <p className="text-black/60 text-sm max-w-md">
        The requested page or tutoring session ID does not exist or has ended.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/topics"
          className="px-5 py-2.5 bg-white hover:bg-black/5 text-black rounded-xl text-sm font-semibold border border-black/15 shadow-sm"
        >
          Explore Topics
        </Link>
      </div>
    </div>
  );
}
