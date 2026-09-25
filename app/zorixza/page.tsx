'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, Wallet, TriangleAlert, ArrowLeftRight, ClipboardCheck, Bell, Users } from 'lucide-react';
import { zxFetch, AuthError, fmtNaira } from '@/lib/zorixza/client';
import { ZxKpi, ZxSection, ZxLoading, ZxError, ZxEmpty, ZxPageHead } from '@/components/zorixza/ui';

interface OpsOverview {
  inventory: { total_skus: number; stock_value_cost: number; low_stock: number; movements_today: number };
  documents: { with_me: number; pending_submission: number; awaiting_verification: number; overdue_held: number };
  work: { today_tasks: number; overdue_tasks: number; daily_report_status: string; team_pending_reports: number };
  notifications: Array<{ title?: string; message?: string; kind?: string; created_at?: string }>;
  unread_count: number;
  approvals_pending: number;
  approvals_mine: number;
  recent_events: Array<{ title: string; summary: string; at: string; entity_type: string; entity_id: string }>;
}

interface PipelineRes {
  pipeline: Array<{ id: string; count: number; total_value: number }>;
  total_leads: number;
}

export default function ZorixzaOverviewPage() {
  const router = useRouter();
  const [ops, setOps] = useState<OpsOverview | null>(null);
  const [pipe, setPipe] = useState<PipelineRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [o, p] = await Promise.all([
        zxFetch<OpsOverview>('/api/operations/overview'),
        zxFetch<PipelineRes>('/api/crm/pipeline'),
      ]);
      setOps(o);
      setPipe(p);
    } catch (e) {
      if (e instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <>
        <ZxPageHead eyebrow="Zorixza · Executive" title="Executive Overview" desc="Live position across sales, stock, documents, work and approvals." />
        <ZxLoading label="Pulling live figures…" />
      </>
    );
  }

  if (error || !ops) return (
    <>
      <ZxPageHead eyebrow="Zorixza · Executive" title="Executive Overview" desc="Live position across sales, stock, documents, work and approvals." />
      <ZxError message={error ?? 'No data returned'} onRetry={load} />
    </>
  );

  const pipelineValue = (pipe?.pipeline ?? []).reduce((s, r) => s + Number(r.total_value || 0), 0);
  const maxStage = Math.max(1, ...(pipe?.pipeline ?? []).map((r) => Number(r.count || 0)));

  return (
    <>
      <ZxPageHead eyebrow="Zorixza · Executive" title="Executive Overview" desc="Live position across sales, stock, documents, work and approvals." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ZxKpi icon={Users} label="Open leads" value={String(pipe?.total_leads ?? 0)} sub={`Pipeline ${fmtNaira(pipelineValue)}`} />
        <ZxKpi icon={Boxes} label="SKUs · stock value" value={String(ops.inventory.total_skus)} sub={fmtNaira(ops.inventory.stock_value_cost)} />
        <ZxKpi icon={TriangleAlert} label="Low stock lines" value={String(ops.inventory.low_stock)} sub={`${ops.inventory.movements_today} movements today`} />
        <ZxKpi icon={ClipboardCheck} label="My tasks today" value={String(ops.work.today_tasks)} sub={`${ops.work.overdue_tasks} overdue`} />
        <ZxKpi icon={Wallet} label="Approvals pending" value={String(ops.approvals_pending)} sub={`${ops.approvals_mine} assigned to me`} />
        <ZxKpi icon={Bell} label="Unread alerts" value={String(ops.unread_count)} sub={`Report: ${ops.work.daily_report_status.replace(/_/g, ' ')}`} />
        <ZxKpi icon={ClipboardCheck} label="Docs with me" value={String(ops.documents.with_me)} sub={`${ops.documents.awaiting_verification} awaiting verification`} />
        <ZxKpi icon={ArrowLeftRight} label="Movements today" value={String(ops.inventory.movements_today)} sub="Across all warehouses" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <ZxSection title="Sales pipeline" hint="Live lead counts per stage">
          {(pipe?.pipeline ?? []).length === 0 ? (
            <ZxEmpty title="No pipeline data yet" hint="Create your first lead in the CRM workspace." />
          ) : (
            <div className="space-y-2.5">
              {(pipe?.pipeline ?? []).map((r) => (
                <div key={r.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-700 capitalize">{r.id.replace(/_/g, ' ')}</span>
                    <span className="text-slate-500 tabular-nums">{r.count} · {fmtNaira(Number(r.total_value || 0))}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(Number(r.count || 0) / maxStage) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ZxSection>

        <ZxSection title="Recent business events" hint="Latest audited activity">
          {ops.recent_events.length === 0 ? (
            <ZxEmpty title="No events yet" hint="Activity across modules will appear here." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {ops.recent_events.map((e, i) => (
                <li key={`${e.at}-${i}`} className="py-2.5 flex gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{e.title}</p>
                    {e.summary && <p className="text-xs text-slate-500 truncate">{e.summary}</p>}
                    <p className="text-[11px] text-slate-400">{new Date(e.at).toLocaleString()} · {e.entity_type}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ZxSection>
      </div>
    </>
  );
}
