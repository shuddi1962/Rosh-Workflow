'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { zxFetch, AuthError, fmtNaira } from '@/lib/zorixza/client';
import { ZxSection, ZxLoading, ZxError, ZxEmpty, ZxPageHead } from '@/components/zorixza/ui';

interface Receipt extends Record<string, unknown> {
  id: string;
  receipt_code: string | null;
  supplier_vendor: string | null;
  amount_naira: number;
  status: string;
  current_holder: string | null;
  date_received: string | null;
}

function asArray<T>(j: unknown): T[] {
  if (Array.isArray(j)) return j as T[];
  if (j && typeof j === 'object') {
    const o = j as Record<string, unknown>;
    for (const k of ['receipts', 'items', 'rows', 'data']) {
      if (Array.isArray(o[k])) return o[k] as T[];
    }
  }
  return [];
}

export default function ZorixzaDocumentsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const j = await zxFetch<unknown>('/api/documents/receipts?limit=200');
      setRows(asArray<Receipt>(j));
    } catch (e) {
      if (e instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!status || String(r.status) === status) &&
        (!needle || `${String(r.receipt_code ?? '')} ${String(r.supplier_vendor ?? '')}`.toLowerCase().includes(needle))
    );
  }, [rows, q, status]);

  const statuses = useMemo(() => [...new Set(rows.map((r) => String(r.status)))].sort(), [rows]);

  return (
    <>
      <ZxPageHead eyebrow="Zorixza · Documents" title="Document Custody" desc="Live receipt custody chain — who holds what, and what needs verification." />
      {loading ? (
        <ZxLoading label="Loading custody records…" />
      ) : error ? (
        <ZxError message={error} onRetry={load} />
      ) : (
        <ZxSection title="Receipts" hint={`${filtered.length} shown`}>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex items-center gap-2 flex-1 border border-slate-200 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code or vendor…" className="w-full text-sm focus:outline-none" />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          {filtered.length === 0 ? (
            <ZxEmpty title="No custody records" hint="Recorded receipts will appear here with holder and status." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="py-2 pr-3">Code</th>
                    <th className="py-2 pr-3">Vendor</th>
                    <th className="py-2 pr-3 text-right">Amount</th>
                    <th className="py-2 pr-3">Holder</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((r) => (
                    <tr key={String(r.id)} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-3 font-mono text-xs font-semibold">{String(r.receipt_code ?? '—')}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{String(r.supplier_vendor ?? '—')}</td>
                      <td className="py-2.5 pr-3 text-right font-bold tabular-nums">{fmtNaira(Number(r.amount_naira || 0))}</td>
                      <td className="py-2.5 pr-3 text-slate-500">{String(r.current_holder ?? '—')}</td>
                      <td className="py-2.5">
                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {String(r.status).replace(/_/g, ' ')}
                        </span>
                      </td>
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
