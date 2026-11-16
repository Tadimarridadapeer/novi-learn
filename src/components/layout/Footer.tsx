'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide footer on tutor workspace screen to keep maximum whiteboard immersion
  if (pathname?.startsWith('/tutor/')) return null;

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 py-6 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
        {/* Brand info */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-600/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200">Novi Learn</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">AI Mathematics Tutor</span>
        </div>

        {/* Portfolio Link / Copyright */}
        <div className="flex items-center gap-1.5 text-center sm:text-right">
          <span>All rights reserved by</span>
          <a
            href="https://www.tadimarridadapeer.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-4 decoration-brand-500/40 hover:decoration-brand-300 transition-colors inline-flex items-center gap-1 group"
          >
            <span>Tadimarri Dadapeer</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </footer>
  );
};
