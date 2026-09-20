'use client';

import React from 'react';

const demographics = [
  { label: 'Lagos', pct: 32, color: 'bg-blue-500' },
  { label: 'Port Harcourt', pct: 28, color: 'bg-indigo-500' },
  { label: 'Abuja', pct: 18, color: 'bg-emerald-500' },
  { label: 'Yenagoa', pct: 12, color: 'bg-amber-500' },
  { label: 'Other', pct: 10, color: 'bg-slate-300' },
];

export const AudienceDemographics: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6">
    <h3 className="text-base font-bold text-slate-900 mb-5">Audience by Location</h3>
    <div className="space-y-4">
      {demographics.map((d) => (
        <div key={d.label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-slate-700 font-medium">{d.label}</span>
            <span className="text-sm font-bold text-slate-900">{d.pct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
    <div className="mt-6 pt-4 border-t border-slate-100">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Age Groups</h4>
      <div className="flex items-end gap-2 h-20">
        {[18, 35, 28, 14, 5].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-indigo-100 rounded-t" style={{ height: `${h * 3}px` }} />
            <span className="text-[10px] text-slate-400">{['18-24', '25-34', '35-44', '45-54', '55+'][i]}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
