'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTenant } from '@/lib/context/TenantContext';
import {
  LayoutDashboard, Send, Users, TrendingUp, Share2, Video, Megaphone, Package, BarChart3, Settings, LogOut, Sparkles, Menu, X, ChevronDown, Bell, ShoppingBag, Smartphone, Zap, ShieldCheck, Phone, MessageSquare, ImageIcon, FileText, Mail, Star, Gift, Printer, FolderOpen, Target, CreditCard, UserCog,
} from 'lucide-react';

const workspaceGroups = [
  {
    label: 'Workspace',
    items: [
      { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
      { icon: Target, label: 'Leads', href: '/dashboard/crm/leads' },
      { icon: Send, label: 'Campaigns', href: '/dashboard/campaigns' },
      { icon: TrendingUp, label: 'Competitors', href: '/dashboard/competitors' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { icon: Share2, label: 'Content', href: '/dashboard/content' },
      { icon: Video, label: 'Video Studio', href: '/dashboard/creative/video' },
      { icon: Megaphone, label: 'WhatsApp', href: '/dashboard/whatsapp' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { icon: Package, label: 'Products', href: '/dashboard/products' },
      { icon: ShoppingBag, label: 'Orders', href: '/dashboard/crm' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ],
  },
];

export const DashboardSidebar: React.FC = () => {
  const { currentTenant, switchTenant, tenants } = useTenant();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#071426] text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-[#1468F5] to-[#3B82F6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && <span className="font-bold tracking-tight text-sm text-white">ROSH</span>}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block text-slate-400 hover:text-white p-1">
            {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>

        <div className="p-3 border-b border-white/10">
          <button onClick={() => setWorkspaceOpen(!workspaceOpen)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
            <span className="text-xl">{currentTenant.logoEmoji}</span>
            {!collapsed && (
              <div className="text-left min-w-0 flex-1">
                <div className="text-xs font-semibold truncate text-white">{currentTenant.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{currentTenant.industry}</div>
              </div>
            )}
            {!collapsed && <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>
          {workspaceOpen && !collapsed && (
            <div className="mt-2 space-y-1">
              {tenants.map((t) => (
                <button key={t.id} onClick={() => { switchTenant(t.id); setWorkspaceOpen(false); }} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${t.id === currentTenant.id ? 'bg-[#1468F5]/20 text-[#1468F5]' : 'text-slate-400 hover:bg-white/5'}`}>
                  <span>{t.logoEmoji}</span>
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {workspaceGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">{group.label}</p>}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <button key={item.label} onClick={() => { router.push(item.href); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${active ? 'bg-[#1468F5]/20 text-[#6B9FFF]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="p-3 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-3 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{currentTenant.logoEmoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-white">{currentTenant.name}</p>
                  <p className="text-[10px] text-slate-400">{currentTenant.plan} Plan</p>
                </div>
              </div>
              <button onClick={() => router.push('/')} className="w-full text-xs text-[#6B9FFF] hover:underline">Marketing Site</button>
            </div>
            <button onClick={() => { router.push('/login'); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-white/5">
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
};