'use client';

import React from 'react';
import { AlertTriangle, Inbox as InboxIcon, Loader2, type LucideIcon } from 'lucide-react';

export function ZxKpi({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="w-4 h-4" />
        <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export function ZxSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl">
      <header className="px-4 sm:px-5 py-3.5 border-b border-slate-100 flex items-baseline gap-3">
        <h2 className="font-bold text-slate-900">{title}</h2>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function ZxLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="space-y-4" aria-live="polite">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            <div className="h-7 w-20 bg-slate-100 rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-3 text-slate-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> {label}
      </div>
    </div>
  );
}

export function ZxError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const isSetupGap =
    message.includes('not set up yet') ||
    message.includes('schema cache') ||
    message.includes('Could not find the table');
  return (
    <div className="bg-white border border-red-200 rounded-xl p-6 flex items-start gap-3" role="alert">
      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900">
          {isSetupGap ? 'Database setup required' : 'Could not load this workspace'}
        </p>
        <p className="text-sm text-slate-500 mt-1">{message}</p>
        {isSetupGap && (
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            One-time fix: open your Supabase project → SQL editor → run{' '}
            <span className="font-mono font-bold text-slate-600">supabase/005_operations.sql</span> through{' '}
            <span className="font-mono font-bold text-slate-600">015_verticals.sql</span> (or the combined{' '}
            <span className="font-mono font-bold text-slate-600">supabase/SETUP_MISSING_TABLES.sql</span>), then press Retry.
          </p>
        )}
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 rounded-lg text-sm font-bold bg-slate-900 text-white hover:bg-slate-700 transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export function ZxEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="py-10 text-center">
      <InboxIcon className="w-8 h-8 text-slate-300 mx-auto" />
      <p className="font-bold text-slate-700 mt-2">{title}</p>
      {hint && <p className="text-sm text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export function ZxPageHead({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">{eyebrow}</p>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">{title}</h1>
      <p className="text-sm text-slate-500 mt-1 max-w-2xl">{desc}</p>
    </div>
  );
}
