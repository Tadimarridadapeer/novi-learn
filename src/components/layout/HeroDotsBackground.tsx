'use client';

import React from 'react';
import Link from 'next/link';

export const HeroDotsBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Dynamic Dot Pattern Grid */}
      <div className="absolute inset-0 bg-dots-pattern opacity-70" />

      {/* Floating Animated Geometric/Dot Particle Elements in Background */}
      <div className="absolute top-12 left-10 w-72 h-72 rounded-full bg-brand-50/70 blur-3xl animate-pulse-subtle" />
      <div className="absolute top-48 right-16 w-80 h-80 rounded-full bg-black/[0.03] blur-3xl animate-float-slow" />
      <div className="absolute bottom-10 left-1/3 w-64 h-64 rounded-full bg-brand-100/50 blur-2xl animate-float-medium" />

      {/* Floating Graphical Math Dots Cluster 1 */}
      <div className="absolute top-20 left-[12%] animate-float-slow opacity-40">
        <div className="grid grid-cols-4 gap-4 p-3">
          <div className="w-2 h-2 rounded-full bg-black/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />
          <div className="w-2 h-2 rounded-full bg-black/40" />
          <div className="w-1 h-1 rounded-full bg-black/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-black/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-brand-600/80" />
          <div className="w-1.5 h-1.5 rounded-full bg-black/50" />
          <div className="w-2 h-2 rounded-full bg-black/60" />
          <div className="w-2 h-2 rounded-full bg-black/40" />
          <div className="w-1 h-1 rounded-full bg-black/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
          <div className="w-1.5 h-1.5 rounded-full bg-black/50" />
        </div>
      </div>

      {/* Floating Graphical Math Dots Cluster 2 */}
      <div className="absolute top-36 right-[14%] animate-float-medium opacity-40">
        <div className="grid grid-cols-5 gap-3.5 p-3">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />
          <div className="w-2 h-2 rounded-full bg-black/50" />
          <div className="w-1 h-1 rounded-full bg-black/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
          <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
          <div className="w-2 h-2 rounded-full bg-black/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-black/30" />
          <div className="w-2 h-2 rounded-full bg-brand-600/70" />
          <div className="w-1 h-1 rounded-full bg-black/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-black/50" />
        </div>
      </div>

      {/* Floating Graphical Math Dots Cluster 3 (Bottom Center) */}
      <div className="absolute bottom-24 left-[20%] animate-float-slow opacity-30">
        <div className="flex gap-4">
          <span className="w-2 h-2 rounded-full bg-brand-600" />
          <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
          <span className="w-3 h-3 rounded-full bg-brand-600/80" />
          <span className="w-1.5 h-1.5 rounded-full bg-black/50" />
          <span className="w-2 h-2 rounded-full bg-black/30" />
        </div>
      </div>

      {/* Floating Coordinate Crosshairs Graphic */}
      <div className="absolute top-28 right-[30%] opacity-20 hidden md:block">
        <div className="w-12 h-12 border-l border-t border-black" />
      </div>
      <div className="absolute bottom-32 right-[22%] opacity-20 hidden md:block">
        <div className="w-12 h-12 border-r border-b border-brand-600" />
      </div>
    </div>
  );
};
