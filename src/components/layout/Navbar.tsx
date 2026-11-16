'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, LayoutDashboard, BookOpen, BarChart3, Settings, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  // Hide main nav on tutor workspace screen to keep maximum whiteboard immersion
  if (pathname?.startsWith('/tutor/')) return null;

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/topics', label: 'Topics', icon: BookOpen },
    { href: '/progress', label: 'Progress', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/admin', label: 'Internal Debugger', icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/30 group-hover:bg-brand-500 transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-slate-100 tracking-tight">Novi Learn</span>
          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Math Tutor
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-brand-400 border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA / Student Profile */}
        <div className="flex items-center gap-3">
          <Link
            href="/tutor/new?topic=quadratic-equations"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-brand-600/20"
          >
            Start Session
          </Link>
        </div>
      </div>
    </header>
  );
};
