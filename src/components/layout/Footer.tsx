'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide footer on tutor workspace screen to keep maximum whiteboard immersion
  if (pathname?.startsWith('/tutor/')) return null;

  return (
    <footer className="w-full bg-white border-t border-black/10 text-black/70 py-6 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
        {/* Brand info (Text only, no icons) */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-black tracking-tight">Novi Learn</span>
          <span className="text-black/30">|</span>
          <span className="text-black/60">AI Mathematics Tutor</span>
        </div>

        {/* Portfolio Link / Copyright */}
        <div className="flex items-center gap-1.5 text-center sm:text-right">
          <span>All rights reserved by</span>
          <a
            href="https://www.tadimarridadapeer.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-brand-600 hover:text-brand-800 underline underline-offset-4 decoration-brand-600/40 hover:decoration-brand-800 transition-colors"
          >
            Tadimarri Dadapeer
          </a>
        </div>
      </div>
    </footer>
  );
};
