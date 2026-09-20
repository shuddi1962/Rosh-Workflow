'use client';

import React from 'react';

export const TrustedLogos: React.FC = () => {
  const logos = ['Hikvision', 'Suzuki Marine', 'Yamaha', 'LivFast Solar', 'NDDC', 'NIMASA'];

  return (
    <section className="py-12 border-y border-slate-100 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-400 mb-8 uppercase tracking-wider">Trusted by industry leaders</p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-50">
          {logos.map((name) => (
            <div key={name} className="text-lg sm:text-xl font-bold text-slate-400 tracking-tight">{name}</div>
          ))}
        </div>
      </div>
    </section>
  );
};
