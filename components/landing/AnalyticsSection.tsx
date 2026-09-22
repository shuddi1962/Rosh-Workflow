'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export const AnalyticsSection: React.FC = () => {
  const { currentTenant, formatCurrency } = useTenant();
  const revHistory = currentTenant.revenueHistory || [];
  const maxVal = Math.max(...revHistory.map((r) => r.current), 1);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F9FD]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1833] mb-4">Powerful Analytics</h2>
            <p className="text-xl font-semibold text-[#1468F5] mb-3">Real Data. Smarter Decisions.</p>
            <p className="text-lg text-slate-600 mb-8">Track performance, understand your audience, and make data-driven decisions with beautiful visuals and real-time insights.</p>
            <ul className="space-y-3 mb-8">
              {['Interactive dashboards', 'Custom reports', 'Advanced analytics', 'Export & share'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-[#1468F5]/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-3 h-3 text-[#1468F5]" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <button className="px-6 py-3 rounded-xl text-sm font-bold bg-[#1468F5] text-white hover:bg-[#1257D4] transition">
              Explore Analytics
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl shadow-slate-200/50">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { icon: DollarSign, label: 'Revenue', value: formatCurrency(currentTenant.monthlyRevenue), change: `+${currentTenant.revenueGrowth}%`, color: '#1468F5' },
                { icon: Users, label: 'Leads', value: currentTenant.totalLeads.toLocaleString(), change: `+${currentTenant.leadsGrowth}%`, color: '#10B981' },
                { icon: TrendingUp, label: 'Conversion', value: `${currentTenant.conversionRate}%`, change: `+${currentTenant.conversionGrowth}%`, color: '#1468F5' },
                { icon: BarChart3, label: 'AOV', value: formatCurrency(currentTenant.avgOrderValue), change: '+8.2%', color: '#EF233C' },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-xl bg-[#F6F9FD]">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className="w-4 h-4" style={{ color: m.color }} />
                    <span className="text-xs text-slate-500">{m.label}</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{m.value}</p>
                  <p className="text-xs font-semibold text-[#10B981]">{m.change}</p>
                </div>
              ))}
            </div>
            <div className="flex items-end gap-2 h-32">
              {revHistory.map((m) => {
                const curH = (m.current / maxVal) * 100;
                return (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-[#1468F5] rounded-t" style={{ height: `${curH}%` }} />
                    <span className="text-[10px] text-slate-400">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};