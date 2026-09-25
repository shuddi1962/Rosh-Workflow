'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, ArrowRight } from 'lucide-react';
import { fmtNaira } from '@/lib/zorixza/client';
import { useZxQuery, asArray, ZxBadge } from '@/components/zorixza/data';
import { ZxKpi, ZxSection, ZxLoading, ZxError, ZxEmpty } from '@/components/zorixza/ui';

interface StageRow { id: string; count: number; total_value: number }
interface Lead extends Record<string, unknown> { id: string; full_name: string; company: string | null; stage: string; score: number }

export default function ZorixzaCrmDashboard() {
  const router = useRouter();
  const pipe = useZxQuery<{ pipeline: StageRow[]; total_leads: number }>('/api/crm/pipeline');
  const leads = useZxQuery<{ leads: Lead[] }>('/api/crm/leads?limit=6');

  if (pipe.loading || leads.loading) return <ZxLoading label="Loading CRM…" />;
  if (pipe.error) return <ZxError message={pipe.error} onRetry={() => { pipe.reload(); leads.reload(); }} />;

  const stages = pipe.data?.pipeline ?? [];
  const value = stages.reduce((s, r) => s + Number(r.total_value || 0), 0);
  const hot = stages.filter((s) => ['interested', 'quote_sent', 'negotiation'].includes(s.id))
    .reduce((s, r) => s + Number(r.count || 0), 0);
  const recent = asArray<Lead>(leads.data, ['leads']).slice(0, 6);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <ZxKpi icon={Users} label="Total leads" value={String(pipe.data?.total_leads ?? 0)} />
        <ZxKpi icon={Users} label="Pipeline value" value={fmtNaira(value)} />
        <ZxKpi icon={Users} label="Hot stages" value={String(hot)} sub="interested → negotiation" />
        <ZxKpi icon={Users} label="Won" value={String(stages.find((s) => s.id === 'customer')?.count ?? 0)} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <ZxSection title="Pipeline by stage" hint="Live counts">
          {stages.length === 0 ? <ZxEmpty title="No pipeline data yet" /> : (
            <div className="space-y-2.5">
              {stages.map((r) => (
                <div key={r.id} className="flex items-center gap-3 text-sm">
                  <span className="font-semibold text-slate-700 capitalize w-32 truncate">{r.id.replace(/_/g, ' ')}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Number(r.count || 0) * 12)}%` }} />
                  </div>
                  <span className="text-slate-500 tabular-nums w-24 text-right">{r.count} · {fmtNaira(Number(r.total_value || 0))}</span>
                </div>
              ))}
            </div>
          )}
        </ZxSection>
        <ZxSection title="Recent leads" hint="Latest records">
          {recent.length === 0 ? <ZxEmpty title="No leads yet" hint="Create the first lead on the Leads tab." /> : (
            <ul className="divide-y divide-slate-100">
              {recent.map((l) => (
                <li key={String(l.id)} className="py-2 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{String(l.full_name || '—')}</p>
                    <p className="text-xs text-slate-400 truncate">{String(l.company ?? '')}</p>
                  </div>
                  <ZxBadge>{String(l.stage).replace(/_/g, ' ')}</ZxBadge>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => router.push('/zorixza/crm/leads')} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:gap-2.5 transition-all">
            Open Leads <ArrowRight className="w-4 h-4" />
          </button>
        </ZxSection>
      </div>
    </>
  );
}
