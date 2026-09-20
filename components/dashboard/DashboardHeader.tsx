'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Bell, Search, ChevronDown, Sparkles } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  const { currentTenant, tenants, switchTenant, formatCurrency, activeFilterPeriod, setActiveFilterPeriod } = useTenant();
  const [tenantOpen, setTenantOpen] = React.useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
        <span className="text-xs text-slate-400 hidden sm:block">Welcome back, {currentTenant.ownerName}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input placeholder="Search..." className="bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none w-40" />
        </div>

        <div className="flex bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          {(['today', '7d', '30d', 'ytd'] as const).map((p) => (
            <button key={p} onClick={() => setActiveFilterPeriod(p)} className={`px-3 py-1.5 text-xs font-semibold transition ${activeFilterPeriod === p ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative">
          <button onClick={() => setTenantOpen(!tenantOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition text-sm">
            <span className="text-lg">{currentTenant.logoEmoji}</span>
            <span className="hidden sm:block font-medium text-slate-700 max-w-[120px] truncate">{currentTenant.name}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          {tenantOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50">
              <div className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">Switch Business</div>
              {tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { switchTenant(t.id); setTenantOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${t.id === currentTenant.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span className="text-lg">{t.logoEmoji}</span>
                  <div className="text-left min-w-0">
                    <div className="font-medium truncate">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.industry}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="relative p-2 rounded-xl hover:bg-slate-50 transition">
          <Bell className="w-5 h-5 text-slate-500" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
};
