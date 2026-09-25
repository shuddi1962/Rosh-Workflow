'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, FileCheck, Bell, ArrowRight } from 'lucide-react';
import { useZxQuery, asArray } from '@/components/zorixza/data';
import { ZxKpi, ZxSection, ZxLoading, ZxError, ZxEmpty } from '@/components/zorixza/ui';

interface OpsOverview {
  documents: { with_me: number; awaiting_verification: number };
  work: { today_tasks: number; overdue_tasks: number; daily_report_status: string };
  notifications: Array<{ title?: string; message?: string; created_at?: string }>;
  unread_count: number;
  approvals_pending: number;
  approvals_mine: number;
}
interface Approval extends Record<string, unknown> { id: string; entity_ref: string | null; entity_type: string; status: string }
interface Schedule extends Record<string, unknown> { id: string; task_title: string; due_date: string | null; status: string }

export default function ZorixzaOperationsDashboard() {
  const router = useRouter();
  const ops = useZxQuery<OpsOverview>('/api/operations/overview');
  const appr = useZxQuery<{ approvals: Approval[] }>('/api/approvals?status=pending&limit=6');
  const sched = useZxQuery<{ schedules: Schedule[] }>('/api/work/schedules?scope=mine&limit=6');

  if (ops.loading || appr.loading || sched.loading) return <ZxLoading label="Loading operations…" />;
  if (ops.error || !ops.data) return <ZxError message={ops.error ?? 'No data returned'} onRetry={() => { ops.reload(); appr.reload(); sched.reload(); }} />;

  const o = ops.data;
  const pending = asArray<Approval>(appr.data, ['approvals']).slice(0, 5);
  const today = asArray<Schedule>(sched.data, ['schedules']).slice(0, 5);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <ZxKpi icon={ClipboardCheck} label="My tasks today" value={String(o.work.today_tasks)} sub={`${o.work.overdue_tasks} overdue`} />
        <ZxKpi icon={FileCheck} label="Docs in custody" value={String(o.documents.with_me)} sub={`${o.documents.awaiting_verification} awaiting verification`} />
        <ZxKpi icon={Bell} label="My approvals" value={String(o.approvals_mine)} sub={`${o.approvals_pending} pending overall`} />
        <ZxKpi icon={ClipboardCheck} label="Report status" value={o.work.daily_report_status.replace(/_/g, ' ')} sub={`${o.unread_count} unread alerts`} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <ZxSection title="Approval inbox" hint="Universal queue">
          {pending.length === 0 ? <ZxEmpty title="Nothing awaiting approval" /> : (
            <ul className="divide-y divide-slate-100">
              {pending.map((a) => (
                <li key={String(a.id)} className="py-2 flex items-center gap-3 text-sm">
                  <span className="font-bold text-slate-800 flex-1 truncate">{String(a.entity_ref || a.entity_type)}</span>
                  <span className="text-xs text-slate-400">{String(a.entity_type)}</span>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => router.push('/zorixza/operations/approvals')} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:gap-2.5 transition-all">
            Open inbox <ArrowRight className="w-4 h-4" />
          </button>
        </ZxSection>
        <ZxSection title="My schedule" hint="Due soonest first">
          {today.length === 0 ? <ZxEmpty title="No scheduled tasks" /> : (
            <ul className="divide-y divide-slate-100">
              {today.map((s) => (
                <li key={String(s.id)} className="py-2 flex items-center gap-3 text-sm">
                  <span className="font-bold text-slate-800 flex-1 truncate">{String(s.task_title)}</span>
                  <span className="text-xs text-slate-400">{String(s.due_date || '').slice(0, 10)}</span>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => router.push('/zorixza/operations/schedules')} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:gap-2.5 transition-all">
            Open schedules <ArrowRight className="w-4 h-4" />
          </button>
        </ZxSection>
      </div>
    </>
  );
}
