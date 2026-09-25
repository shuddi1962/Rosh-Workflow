'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { zxFetch, AuthError } from '@/lib/zorixza/client';
import { ZxSection, ZxLoading, ZxError, ZxEmpty, ZxPageHead } from '@/components/zorixza/ui';

interface Lead extends Record<string, unknown> {
  id: string;
  full_name: string;
  company: string | null;
  phone: string;
  stage: string;
  score: number;
}

const STAGES = ['new_lead', 'qualified', 'contacted', 'interested', 'quote_sent', 'negotiation', 'customer', 'lost'];

export default function ZorixzaCrmPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const j = await zxFetch<{ leads: Lead[]; total: number }>('/api/crm/leads?limit=100');
      setLeads(j.leads ?? []);
      setTotal(j.total ?? 0);
    } catch (e) {
      if (e instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads.filter(
      (l) =>
        (!stage || String(l.stage) === stage) &&
        (!needle ||
          `${String(l.full_name)} ${String(l.company ?? '')} ${String(l.phone)}`.toLowerCase().includes(needle))
    );
  }, [leads, q, stage]);

  return (
    <>
      <ZxPageHead eyebrow="Zorixza · CRM" title="Customers & Pipeline" desc={`Live leads from the CRM service — ${total} total records.`} />
      {loading ? (
        <ZxLoading label="Loading leads…" />
      ) : error ? (
        <ZxError message={error} onRetry={load} />
      ) : (
        <ZxSection title="Leads" hint={`${filtered.length} shown`}>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex items-center gap-2 flex-1 border border-slate-200 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, company, phone…"
                className="w-full text-sm focus:outline-none"
              />
            </div>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">All stages</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          {filtered.length === 0 ? (
            <ZxEmpty title="No leads found" hint="Adjust the search or create the first lead in Zorixza CRM." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Company</th>
                    <th className="py-2 pr-3">Phone</th>
                    <th className="py-2 pr-3">Stage</th>
                    <th className="py-2 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((l) => (
                    <tr key={String(l.id)} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-3 font-semibold text-slate-800">{String(l.full_name || '—')}</td>
                      <td className="py-2.5 pr-3 text-slate-500">{String(l.company ?? '—')}</td>
                      <td className="py-2.5 pr-3 text-slate-500 tabular-nums">{String(l.phone || '—')}</td>
                      <td className="py-2.5 pr-3">
                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                          {String(l.stage).replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold tabular-nums">{Number(l.score || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ZxSection>
      )}
    </>
  );
}
