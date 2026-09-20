'use client';

import React from 'react';
import { PipelineStage } from '@/lib/types';

const stages: PipelineStage[] = [
  { id: '1', name: 'New Leads', count: 142, amount: '₦12.8M', color: 'bg-blue-500' },
  { id: '2', name: 'Contacted', count: 86, amount: '₦8.4M', color: 'bg-indigo-500' },
  { id: '3', name: 'Qualified', count: 48, amount: '₦5.2M', color: 'bg-purple-500' },
  { id: '4', name: 'Proposal Sent', count: 24, amount: '₦3.1M', color: 'bg-amber-500' },
  { id: '5', name: 'Won', count: 18, amount: '₦2.4M', color: 'bg-emerald-500' },
];

export const SalesPipelineCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-base font-bold text-slate-900">Sales Pipeline</h3>
      <span className="text-xs text-slate-400">318 total leads</span>
    </div>
    <div className="space-y-3">
      {stages.map((s, i) => (
        <div key={s.id} className="flex items-center gap-3">
          <div className={`w-2 h-8 rounded-full ${s.color}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">{s.name}</span>
              <span className="text-sm font-bold text-slate-900">{s.amount}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div className={`h-full ${s.color} rounded-full`} style={{ width: `${(s.count / stages[0].count) * 100}%` }} />
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 w-8 text-right">{s.count}</span>
        </div>
      ))}
    </div>
    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
      <span className="text-xs text-slate-400">Total pipeline value</span>
      <span className="text-lg font-bold text-slate-900">₦31.9M</span>
    </div>
  </div>
);
