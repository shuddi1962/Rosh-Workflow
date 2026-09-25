'use client';

import React from 'react';
import { Wrench, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useZxQuery, asArray } from '@/components/zorixza/data';
import { ZxKpi, ZxSection, ZxLoading, ZxError, ZxEmpty } from '@/components/zorixza/ui';

interface Schedule extends Record<string, unknown> {
  id: string; task_title: string; status: string; priority: string;
  due_date: string | null; related_module: string; related_project: string | null;
  assigned_to_name: string | null;
}

const isField = (s: Schedule) =>
  ['field_service', 'installation', 'maintenance'].includes(String(s.related_module));

export default function FieldOverviewPage() {
  const { data, loading, error, reload } = useZxQuery<{ schedules: Schedule[] }>('/api/work/schedules?scope=all');
  const rows = asArray<Schedule>(data, ['schedules']).filter(isField);

  if (loading) return <ZxLoading label="Pulling field position…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  const today = new Date().toISOString().slice(0, 10);
  const todayJobs = rows.filter((r) => String(r.due_date || '').slice(0, 10) === today && !['completed', 'cancelled'].includes(String(r.status)));
  const open = rows.filter((r) => !['completed', 'cancelled'].includes(String(r.status)));
  const overdue = rows.filter((r) => String(r.status) === 'overdue');
  const done = rows.filter((r) => String(r.status) === 'completed');

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ZxKpi icon={Wrench} label="Jobs today" value={String(todayJobs.length)} sub="Due today, still open" />
        <ZxKpi icon={Clock} label="Open jobs" value={String(open.length)} sub="Across all technicians" />
        <ZxKpi icon={AlertTriangle} label="Overdue" value={String(overdue.length)} sub="Needs redispatch" />
        <ZxKpi icon={CheckCircle2} label="Completed" value={String(done.length)} sub="Signed-off lines" />
      </div>

      <div className="mt-4">
        <ZxSection title="Today's jobs" hint="Dispatch order — owner, site reference and status">
          {todayJobs.length === 0 ? (
            <ZxEmpty title="Nothing due today" hint="Create jobs from the Jobs tab with today's due date." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {todayJobs.map((r) => (
                <li key={String(r.id)} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{String(r.task_title || '—')}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {String(r.related_project || String(r.related_module).replace(/_/g, ' '))} · {String(r.assigned_to_name || 'unassigned')} · {String(r.priority)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 shrink-0">{String(r.status).replace(/_/g, ' ')}</span>
                </li>
              ))}
            </ul>
          )}
        </ZxSection>
      </div>
    </>
  );
}
