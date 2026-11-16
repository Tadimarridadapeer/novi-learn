'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center', backgroundColor: '#0f172a', color: '#f8fafc' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Novi Learn Tutor Session Notice</h2>
        <p style={{ color: '#94a3b8', margin: '1rem 0' }}>
          Your tutoring session status and progress have been safely saved.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0077cd',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Reload Session
        </button>
      </body>
    </html>
  );
}
