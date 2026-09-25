'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zxFetch, AuthError } from '@/lib/zorixza/client';
import { ZxKpi, ZxSection, ZxLoading, ZxError, ZxEmpty, ZxPageHead } from '@/components/zorixza/ui';
import { ClipboardCheck, FileCheck, Bell } from 'lucide-react';

interface OpsOverview {
  documents: { with_me: number; pending_submission: number; awaiting_verification: number; overdue_held: number };
  work: { today_tasks: number; overdue_tasks: number; daily_report_status: string; team_pending_reports: number };
  notifications: Array<{ title?: string; message?: string; kind?: string; created_at?: string }>;
  unread_count: number;
  approvals_pending: number;
  approvals_mine: number;
}

export default function ZorixzaOperationsPage() {
  const router = useRouter();
  const [ops, setOps] = useState<OpsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOps(await zxFetch<OpsOverview>('/api/operations/overview'));
    } catch (e) {
      if (e instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load operations');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <ZxPageHead eyebrow="Zorixza · Operations" title="Daily Operations" desc="Tasks, documents in hand, approvals and your alert queue — live." />
      {loading ? (
        <ZxLoading label="Loading operations…" />
      ) : error || !ops ? (
        <ZxError message={error ?? 'No data returned'} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <ZxKpi icon={ClipboardCheck} label="Tasks due today" value={String(ops.work.today_tasks)} sub={`${ops.work.overdue_tasks} overdue`} />
            <ZxKpi icon={FileCheck} label="Docs in my custody" value={String(ops.documents.with_me)} sub={`${ops.documents.overdue_held} held`} />
            <ZxKpi icon={FileCheck} label="Awaiting verification" value={String(ops.documents.awaiting_verification)} />
            <ZxKpi icon={Bell} label="My approvals" value={String(ops.approvals_mine)} sub={`${ops.approvals_pending} pending overall`} />
          </div>
          <ZxSection title="My notifications" hint={`${ops.unread_count} unread`}>
            {ops.notifications.length === 0 ? (
              <ZxEmpty title="All caught up" hint="New assignments, mentions and alerts land here." />
            ) : (
              <ul className="divide-y divide-slate-100">
                {ops.notifications.map((n, i) => (
                  <li key={i} className="py-2.5">
                    <p className="text-sm font-semibold text-slate-800">{String(n.title ?? n.kind ?? 'Notification')}</p>
                    {n.message && <p className="text-sm text-slate-500">{String(n.message)}</p>}
                    {n.created_at && <p className="text-[11px] text-slate-400">{new Date(String(n.created_at)).toLocaleString()}</p>}
                  </li>
                ))}
              </ul>
            )}
          </ZxSection>
        </>
      )}
    </>
  );
}
