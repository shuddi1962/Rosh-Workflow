'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Sparkles, LayoutDashboard, Send, BarChart3, Users, MessageSquare, Settings, LogOut, TrendingUp, Bot, Zap } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Bot, label: 'AI Automations' },
  { icon: Send, label: 'Campaigns' },
  { icon: Users, label: 'CRM & Leads' },
  { icon: TrendingUp, label: 'Analytics' },
  { icon: MessageSquare, label: 'Social Media' },
  { icon: Zap, label: 'Trend Monitor' },
  { icon: Settings, label: 'Settings' },
];

export const DashboardSidebar: React.FC = () => {
  const { currentTenant } = useTenant();

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight">ROSH AI</span>
            <div className="text-[10px] text-slate-400">Business Dashboard</div>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg">
            {currentTenant.logoEmoji}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{currentTenant.name}</div>
            <div className="text-xs text-slate-400 truncate">{currentTenant.industry}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              item.active
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-slate-500 mb-2">{currentTenant.plan} Plan</div>
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
