'use client';

import React from 'react';

const sources = [
  { label: 'WhatsApp Inbound', pct: 38, color: 'bg-emerald-500' },
  { label: 'Google Search', pct: 24, color: 'bg-blue-500' },
  { label: 'Instagram DM', pct: 18, color: 'bg-pink-500' },
  { label: 'Referral', pct: 12, color: 'bg-amber-500' },
  { label: 'Walk-in', pct: 8, color: 'bg-purple-500' },
];

export const LeadsBySourceChart: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6">
    <h3 className="text-base font-bold text-slate-900 mb-5">Leads by Source</h3>
    <div className="space-y-4">
      {sources.map((s) => (
        <div key={s.label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-slate-700 font-medium">{s.label}</span>
            <span className="text-sm font-bold text-slate-900">{s.pct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${s.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);
