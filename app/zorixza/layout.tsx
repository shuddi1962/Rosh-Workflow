'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Warehouse,
  ClipboardList,
  FolderOpen,
  BarChart3,
  Menu,
  X,
  LogOut,
  Hexagon,
  ArrowLeftRight,
} from 'lucide-react';
import { clsx } from 'clsx';

const NAV = [
  { icon: LayoutDashboard, label: 'Executive Overview', href: '/zorixza' },
  { icon: Users, label: 'CRM', href: '/zorixza/crm' },
  { icon: Warehouse, label: 'Inventory', href: '/zorixza/inventory' },
  { icon: ClipboardList, label: 'Operations', href: '/zorixza/operations' },
  { icon: FolderOpen, label: 'Documents', href: '/zorixza/documents' },
  { icon: BarChart3, label: 'Reports', href: '/zorixza/reports' },
];

function isActive(pathname: string, href: string) {
  if (href === '/zorixza') return pathname === '/zorixza';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function ZorixzaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/login');
      return;
    }
    setUserName(localStorage.getItem('userName') || 'User');
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center animate-pulse">
            <Hexagon className="w-5 h-5 text-slate-950" />
          </div>
          <span className="text-slate-200 font-semibold">Loading Zorixza…</span>
        </div>
      </div>
    );
  }

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const signOut = () => {
    for (const k of ['accessToken', 'refreshToken', 'userRole', 'userName', 'userDepartment', 'staffRole', 'businessId']) {
      localStorage.removeItem(k);
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {open && (
        <div className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* ── Zorixza rail (enterprise solid, distinct from Zorixza) ── */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 w-68 w-[272px] bg-slate-950 text-slate-300 flex flex-col shrink-0 transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Hexagon className="w-5 h-5 text-slate-950" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-white font-extrabold tracking-[0.18em] text-lg leading-none">ZORIXZA</p>
                <p className="text-[11px] text-slate-400 mt-1 tracking-wide">Enterprise Operating System</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Workspaces
          </p>
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <button
                key={item.href}
                onClick={() => go(item.href)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors border-l-2',
                  active
                    ? 'bg-white/[0.07] text-white border-emerald-500'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {item.label}
              </button>
            );
          })}

          <div className="mx-3 mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Program</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              New workspaces (Accounting, HR, AuditIQ…) ship in phases. Status: <span className="text-slate-200 font-semibold">docs/</span>
            </p>
          </div>
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={() => go('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeftRight className="w-[18px] h-[18px]" />
            Switch to Marketing
          </button>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-sm font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <p className="flex-1 min-w-0 text-sm font-semibold text-slate-200 truncate">{userName}</p>
            <button onClick={signOut} title="Sign out" className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-white/5">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-slate-900">Zorixza</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">{NAV.find((n) => isActive(pathname, n.href))?.label ?? 'Workspace'}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live data
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
