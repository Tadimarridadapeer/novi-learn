'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  // Hide main nav on tutor workspace screen to keep maximum whiteboard immersion
  if (pathname?.startsWith('/tutor/')) return null;

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/topics', label: 'Topics' },
    { href: '/progress', label: 'Progress' },
    { href: '/settings', label: 'Settings' },
    { href: '/admin', label: 'Internal Debugger' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Text Logo (Pure typography, no AI icon) */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-extrabold text-xl tracking-tight text-black group-hover:text-brand-600 transition-colors">
            Novi Learn
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-black/5 text-black/60 border border-black/10">
            Math Tutor
          </span>
        </Link>

        {/* Navigation Links (Text only, zero icons) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-black/70 hover:text-black hover:bg-black/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/tutor/new?topic=quadratic-equations"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm"
          >
            Start Session
          </Link>
        </div>
      </div>
    </header>
  );
};
