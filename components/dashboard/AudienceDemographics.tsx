'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { TrendingUp, ShoppingCart, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const demographics = [
  { label: 'Lagos', pct: 32, color: '#1468F5' },
  { label: 'Port Harcourt', pct: 28, color: '#3B82F6' },
  { label: 'Abuja', pct: 18, color: '#10B981' },
  { label: 'Yenagoa', pct: 12, color: '#F59E0B' },
  { label: 'Other', pct: 10, color: '#94A3B8' },
];

const ageGroups = [
  { label: '16–24', pct: 18 },
  { label: '25–34', pct: 35 },
  { label: '35–44', pct: 28 },
  { label: '45–54', pct: 14 },
  { label: '55+', pct: 5 },
];

export const AudienceDemographics: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-base font-bold text-slate-900 mb-5">Audience Demographics</h3>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Gender</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1468F5]/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-[#1468F5]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Male</span>
                  <span className="text-sm font-bold text-slate-900">58%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5">
                  <div className="h-full bg-[#1468F5] rounded-full" style={{ width: '58%' }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EF233C]/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-[#EF233C]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Female</span>
                  <span className="text-sm font-bold text-slate-900">42%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5">
                  <div className="h-full bg-[#EF233C] rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Top Locations</p>
          <div className="space-y-2">
            {demographics.map((d) => (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 font-medium">{d.label}</span>
                  <span className="text-sm font-bold text-slate-900">{d.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Age Ranges</h4>
        <div className="flex items-end gap-2 h-24">
          {ageGroups.map((g) => (
            <div key={g.label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#1468F5]/10 rounded-t" style={{ height: `${g.pct * 2}px` }} />
              <div className="w-full bg-[#1468F5] rounded-b" style={{ height: `${g.pct}px` }} />
              <span className="text-[10px] text-slate-400">{g.label}</span>
              <span className="text-[10px] font-bold text-slate-600">{g.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};