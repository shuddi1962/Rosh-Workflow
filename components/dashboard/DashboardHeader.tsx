'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/context/TenantContext';
import { Bell, Search, ChevronDown, Plus } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  const router = useRouter();
  const { currentTenant, tenants, switchTenant, setIsRegistrationOpen } = useTenant();
  const [tenantOpen, setTenantOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [q, setQ] = useState('');

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="font-semibold text-slate-900">Dashboard</span>
          <span>/</span>
          <span className="hidden sm:block">{currentTenant.industry}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            placeholder="Search PO, GRN, receipt, product, task..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && q.trim().length >= 2) router.push(`/dashboard/search?q=${encodeURIComponent(q.trim())}`) }}
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none w-56"
          />
          <kbd className="text-[10px] text-slate-400 border border-slate-200 rounded px-1">↵</kbd>
        </div>
        <div className="relative">
          <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2 rounded-xl hover:bg-slate-50 transition">
            <Bell className="w-5 h-5 text-slate-500" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50">
              <p className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">Notifications</p>
              <div className="space-y-1">
                <div className="p-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700">New lead qualified from WhatsApp</div>
                <div className="p-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700">Competitor price alert detected</div>
                <div className="p-2 rounded-lg hover:bg-slate-50 text-xs text-slate-700">Campaign performance improved</div>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setTenantOpen(!tenantOpen)} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition text-sm">
            <span className="text-lg">{currentTenant.logoEmoji}</span>
            <span className="hidden sm:block font-medium text-slate-700 max-w-[120px] truncate">{currentTenant.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {tenantOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50">
              <div className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">Switch Business</div>
              {tenants.map((t) => (
                <button key={t.id} onClick={() => { switchTenant(t.id); setTenantOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${t.id === currentTenant.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}>
                  <span className="text-lg">{t.logoEmoji}</span>
                  <div className="text-left min-w-0">
                    <div className="font-medium truncate">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.industry}</div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => { setTenantOpen(false); setIsRegistrationOpen(true); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-[#1468F5] hover:bg-[#1468F5]/5 transition mt-1 border-t border-slate-100 pt-3"
              >
                <span className="w-6 h-6 rounded-full bg-[#1468F5]/10 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </span>
                Register New Business
              </button>
            </div>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
          <span className="text-lg">{currentTenant.logoEmoji}</span>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-700">{currentTenant.ownerName}</p>
            <p className="text-[10px] text-slate-400">{currentTenant.plan}</p>
          </div>
        </div>
      </div>
    </header>
  );
};