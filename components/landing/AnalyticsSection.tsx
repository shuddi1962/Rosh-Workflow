'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export const AnalyticsSection: React.FC = () => {
  const { currentTenant, formatCurrency } = useTenant();
  const revHistory = currentTenant.revenueHistory || [];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Analytics That Actually Matter</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Real-time dashboards tracking revenue, leads, and campaign ROI — not vanity metrics.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: DollarSign, label: 'Monthly Revenue', value: formatCurrency(currentTenant.monthlyRevenue), change: `+${currentTenant.revenueGrowth}%`, color: 'bg-emerald-50 text-emerald-600' },
            { icon: Users, label: 'Total Leads', value: currentTenant.totalLeads.toLocaleString(), change: `+${currentTenant.leadsGrowth}%`, color: 'bg-blue-50 text-blue-600' },
            { icon: TrendingUp, label: 'Conversion Rate', value: `${currentTenant.conversionRate}%`, change: `+${currentTenant.conversionGrowth}%`, color: 'bg-indigo-50 text-indigo-600' },
            { icon: BarChart3, label: 'Avg Order Value', value: formatCurrency(currentTenant.avgOrderValue), change: '+8.2%', color: 'bg-amber-50 text-amber-600' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-4`}>
                <m.icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-500 mb-1">{m.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{m.value}</span>
                <span className="text-sm font-semibold text-emerald-600">{m.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Trend</h3>
          <div className="flex items-end gap-3 h-48">
            {revHistory.map((m) => {
              const maxVal = Math.max(...revHistory.map((x) => x.current));
              const heightPct = (m.current / maxVal) * 100;
              const prevHeightPct = (m.previous / maxVal) * 100;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-1" style={{ height: '160px' }}>
                    <div className="flex-1 bg-slate-100 rounded-t-lg" style={{ height: `${prevHeightPct}%` }} />
                    <div className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg" style={{ height: `${heightPct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">{m.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-100 rounded" /> Previous</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded" /> Current</span>
          </div>
        </div>
      </div>
    </section>
  );
};
