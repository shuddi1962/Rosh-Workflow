'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

export interface WorkspaceTab {
  label: string;
  href: string;
}

/**
 * Module workspace shell (§73): every live Enterprise module renders its own
 * header, sub-navigation and quick actions — a dedicated environment, not a
 * retitled generic page.
 */
export function WorkspaceShell({
  icon: Icon,
  eyebrow,
  title,
  desc,
  tabs,
  actions,
  children,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  desc: string;
  tabs: WorkspaceTab[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const tabActive = (href: string) => {
    const clean = href.split('?')[0];
    return pathname === clean || pathname.startsWith(clean + '/');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-600 to-teal-500" />
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">{eyebrow}</p>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
          </div>
          {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
        </div>
        <nav className="px-3 sm:px-4 pb-3 flex gap-1 overflow-x-auto border-t border-slate-100 pt-3">
          {tabs.map((t) => {
            const active = tabActive(t.href);
            return (
              <button
                key={t.href}
                onClick={() => router.push(t.href)}
                className={clsx(
                  'px-3.5 py-2 rounded-lg text-[13px] font-bold whitespace-nowrap transition',
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
