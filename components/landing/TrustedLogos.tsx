'use client';

import React from 'react';

export const TrustedLogos: React.FC = () => {
  const logos = ['TechSolutions', 'BrightFinance', 'NovaRetail', 'SecureTech', 'HealthPlus', 'GlobalMart'];
  return (
    <section className="py-10 border-y border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-slate-400 mb-8 uppercase tracking-wider">Trusted by businesses worldwide</p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-40">
          {logos.map((name) => (
            <div key={name} className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{name}</div>
          ))}
        </div>
      </div>
    </section>
  );
};