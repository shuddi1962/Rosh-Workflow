'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { zxFetch, AuthError } from '@/lib/zorixza/client';
import { ZxEmpty } from '@/components/zorixza/ui';

/** GET with loading/error/retry + 401 → login. */
export function useZxQuery<T>(path: string | null) {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      setData(await zxFetch<T>(path));
    } catch (e) {
      if (e instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [path, router]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}

/** Pull an array out of the common envelope shapes. */
export function asArray<T>(j: unknown, keys: string[] = ['items', 'rows', 'data', 'files', 'folders', 'leads', 'customers', 'warehouses', 'movements', 'schedules', 'approvals', 'receipts', 'reports']): T[] {
  if (Array.isArray(j)) return j as T[];
  if (j && typeof j === 'object') {
    const o = j as Record<string, unknown>;
    for (const k of keys) if (Array.isArray(o[k])) return o[k] as T[];
  }
  return [];
}

export interface ZxColumn<T> {
  key: string;
  label: string;
  align?: 'left' | 'right';
  render: (row: T) => React.ReactNode;
}

/** Searchable table with empty state. All rows render from real API data. */
export function ZxTable<T extends Record<string, unknown>>({
  columns,
  rows,
  searchKeys,
  searchPlaceholder = 'Search…',
  statusKey,
  statusOptions,
  emptyTitle = 'Nothing here yet',
  emptyHint,
}: {
  columns: ZxColumn<T>[];
  rows: T[];
  searchKeys: string[];
  searchPlaceholder?: string;
  statusKey?: string;
  statusOptions?: string[];
  emptyTitle?: string;
  emptyHint?: string;
}) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!statusKey || !status || String(r[statusKey] ?? '') === status) &&
        (!needle || searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(needle)))
    );
  }, [rows, q, status, statusKey, searchKeys]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1 border border-slate-200 rounded-lg px-3 py-2 bg-white">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full text-sm focus:outline-none bg-transparent"
          />
        </div>
        {statusKey && statusOptions && (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        )}
      </div>
      {filtered.length === 0 ? (
        <ZxEmpty title={emptyTitle} hint={emptyHint} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                {columns.map((c) => (
                  <th key={c.key} className={`py-2 pr-3 font-bold ${c.align === 'right' ? 'text-right' : ''}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r, i) => (
                <tr key={String(r.id ?? i)} className="hover:bg-slate-50">
                  {columns.map((c) => (
                    <td key={c.key} className={`py-2.5 pr-3 ${c.align === 'right' ? 'text-right' : ''}`}>
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ZxBadge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'green' | 'red' | 'amber' | 'blue' }) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
  };
  return (
    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${tones[tone]}`}>
      {children}
    </span>
  );
}
