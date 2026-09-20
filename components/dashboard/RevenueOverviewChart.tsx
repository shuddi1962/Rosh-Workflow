'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';

export const RevenueOverviewChart: React.FC = () => {
  const { currentTenant, formatCurrency } = useTenant();
  const data = currentTenant.revenueHistory || [];
  const maxVal = Math.max(...data.map((d) => d.current), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-slate-900">Revenue Overview</h3>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-200 rounded" /> Previous</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded" /> Current</span>
        </div>
      </div>
      <div className="flex items-end gap-2 h-48">
        {data.map((m) => {
          const curH = (m.current / maxVal) * 100;
          const prevH = (m.previous / maxVal) * 100;
          return (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-1" style={{ height: '160px' }}>
                <div className="flex-1 bg-slate-100 rounded-t-md" style={{ height: `${prevH}%` }} />
                <div className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-md" style={{ height: `${curH}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
