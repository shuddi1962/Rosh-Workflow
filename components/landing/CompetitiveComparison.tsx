'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

const rows = [
  { feature: 'WhatsApp Auto-response', rosh: true, manual: false, tools: false },
  { feature: 'AI Content Generation', rosh: true, manual: false, tools: true },
  { feature: 'Multi-channel Campaigns', rosh: true, manual: false, tools: false },
  { feature: 'Live Competitor Spy', rosh: true, manual: false, tools: false },
  { feature: 'CRM Pipeline Management', rosh: true, manual: true, tools: false },
  { feature: 'Social Media Scheduler', rosh: true, manual: false, tools: true },
  { feature: 'Lead Scoring & Qualification', rosh: true, manual: true, tools: false },
  { feature: 'Revenue Analytics Dashboard', rosh: true, manual: false, tools: false },
  { feature: 'Real-time Trend Monitor', rosh: true, manual: false, tools: false },
  { feature: 'Setup Time', rosh: '15 minutes', manual: 'Hours/week', tools: '2-4 weeks' },
];

const Cell: React.FC<{ value: boolean | string }> = ({ value }) => {
  if (value === true) return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="w-5 h-5 text-slate-300 mx-auto" />;
  return <span className="text-sm font-medium text-slate-700">{value}</span>;
};

export const CompetitiveComparison: React.FC = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why Businesses Choose ROSH</h2>
        <p className="text-lg text-slate-600">One platform replacing scattered tools and manual workflows</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">
          <div className="p-4">Feature</div>
          <div className="p-4 text-center text-blue-600">Rosh AI</div>
          <div className="p-4 text-center">Manual Process</div>
          <div className="p-4 text-center">Scattered Tools</div>
        </div>
        {rows.map((r, i) => (
          <div key={r.feature} className={`grid grid-cols-4 text-sm ${i < rows.length - 1 ? 'border-b border-slate-100' : ''} ${r.feature === 'Setup Time' ? 'bg-blue-50/50' : ''}`}>
            <div className="p-4 font-medium text-slate-700">{r.feature}</div>
            <div className="p-4 text-center">{Cell({ value: r.rosh })}</div>
            <div className="p-4 text-center">{Cell({ value: r.manual })}</div>
            <div className="p-4 text-center">{Cell({ value: r.tools })}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
