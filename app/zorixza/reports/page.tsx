'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zxFetch, AuthError } from '@/lib/zorixza/client';
import { ZxKpi, ZxSection, ZxLoading, ZxError, ZxEmpty, ZxPageHead } from '@/components/zorixza/ui';
import { FileText, CalendarCheck } from 'lucide-react';

interface Report extends Record<string, unknown> {
  id: string;
  report_date?: string;
  period?: string;
  status: string;
  employee_id?: string;
  title?: string;
}

function asArray<T>(j: unknown): T[] {
  if (Array.isArray(j)) return j as T[];
  if (j && typeof j === 'object') {
    const o = j as Record<string, unknown>;
    for (const k of ['reports', 'items', 'rows', 'data']) {
      if (Array.isArray(o[k])) return o[k] as T[];
    }
  }
  return [];
}

export default function ZorixzaReportsPage() {
  const router = useRouter();
  const [daily, setDaily] = useState<Report[]>([]);
  const [monthly, setMonthly] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, m] = await Promise.all([
        zxFetch<unknown>('/api/work/daily-reports?scope=all&limit=50'),
        zxFetch<unknown>('/api/work/monthly-reports?scope=all&limit=24'),
      ]);
      setDaily(asArray<Report>(d));
      setMonthly(asArray<Report>(m));
    } catch (e) {
      if (e instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitted = daily.filter((r) => String(r.status) === 'submitted').length;

  return (
    <>
      <ZxPageHead eyebrow="Zorixza · Reports" title="Staff Reports" desc="Daily and monthly submissions flowing up the review chain — live." />
      {loading ? (
        <ZxLoading label="Loading reports…" />
      ) : error ? (
        <ZxError message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <ZxKpi icon={FileText} label="Daily reports (recent)" value={String(daily.length)} sub={`${submitted} awaiting review`} />
            <ZxKpi icon={CalendarCheck} label="Monthly reports" value={String(monthly.length)} />
            <ZxKpi icon={FileText} label="Review queue" value={String(submitted)} sub="Submitted, not yet approved" />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <ZxSection title="Daily reports" hint="Most recent first">
              {daily.length === 0 ? (
                <ZxEmpty title="No daily reports yet" hint="Submissions from the team will queue here." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {daily.slice(0, 15).map((r) => (
                    <li key={String(r.id)} className="py-2.5 flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-800 flex-1">
                        {String(r.report_date ?? r.title ?? 'Report')}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {String(r.status).replace(/_/g, ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </ZxSection>
            <ZxSection title="Monthly reports" hint="Most recent first">
              {monthly.length === 0 ? (
                <ZxEmpty title="No monthly reports yet" hint="Month-end packs will appear here." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {monthly.slice(0, 15).map((r) => (
                    <li key={String(r.id)} className="py-2.5 flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-800 flex-1">
                        {String(r.period ?? r.report_date ?? r.title ?? 'Report')}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {String(r.status).replace(/_/g, ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </ZxSection>
          </div>
        </>
      )}
    </>
  );
}
