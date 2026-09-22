'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Zap, ArrowRight, Settings, BarChart3, Shield } from 'lucide-react';

export const MultiTenantIndustryPreview: React.FC = () => {
  const { tenants, switchTenant, currentTenant } = useTenant();
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#071426]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">One Platform. Multiple Businesses.</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">GrowPilot is built as a multi-tenant platform, allowing every business to operate inside its own secure workspace while using the same powerful infrastructure.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-4">
            {tenants.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTenant(t.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  currentTenant.id === t.id
                    ? 'border-[#1468F5] bg-[#1468F5]/10 shadow-lg shadow-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-2">{t.logoEmoji}</div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-slate-400">{t.industry}</p>
              </button>
            ))}
          </div>

          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-2xl">{currentTenant.logoEmoji}</div>
              <div>
                <p className="text-lg font-bold text-white">{currentTenant.name}</p>
                <p className="text-sm text-slate-400">{currentTenant.industry} · {currentTenant.plan} Plan</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-slate-400">AI Agents</p>
                <p className="text-xl font-bold text-white">{currentTenant.automations.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-slate-400">Revenue</p>
                <p className="text-xl font-bold text-white">{currentTenant.currencySymbol}{(currentTenant.monthlyRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-slate-400">Conversion</p>
                <p className="text-xl font-bold text-white">{currentTenant.conversionRate}%</p>
              </div>
            </div>
            <div className="space-y-2">
              {['Separate secure workspaces', 'Individual subscriptions & billing', 'Team management', 'Business-specific data', 'Role-based access', 'Scalable infrastructure'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1468F5]" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};