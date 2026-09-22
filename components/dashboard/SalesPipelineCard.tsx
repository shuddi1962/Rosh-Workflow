'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';

const stages = [
  { id: '1', name: 'New Leads', count: 248, amount: '₦1,240,000', color: '#1468F5', width: 100 },
  { id: '2', name: 'Contacted', count: 182, amount: '₦910,000', color: '#3B82F6', width: 73 },
  { id: '3', name: 'Qualified', count: 120, amount: '₦720,000', color: '#10B981', width: 48 },
  { id: '4', name: 'Proposal Sent', count: 76, amount: '₦480,000', color: '#F59E0B', width: 31 },
  { id: '5', name: 'Closed Won', count: 42, amount: '₦260,000', color: '#10B981', width: 17 },
];

export const SalesPipelineCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-slate-900">Sales Pipeline</h3>
        <span className="text-xs text-slate-400">{stages.reduce((s, st) => s + st.count, 0).toLocaleString()} total leads</span>
      </div>
      <div className="space-y-3">
        {stages.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: s.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{s.name}</span>
                <span className="text-sm font-bold text-slate-900">{s.amount}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${s.width}%`, backgroundColor: s.color }}
                />
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500 w-8 text-right">{s.count}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">Total pipeline value</span>
        <span className="text-lg font-bold text-slate-900">₦3,610,000</span>
      </div>
    </div>
  );
};