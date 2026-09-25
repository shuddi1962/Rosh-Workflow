'use client';

import React from 'react';
import { Briefcase, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useZxQuery, asArray } from '@/components/zorixza/data';
import { ZxKpi, ZxSection, ZxLoading, ZxError, ZxEmpty } from '@/components/zorixza/ui';

interface Schedule extends Record<string, unknown> {
  id: string; task_title: string; status: string; priority: string;
  due_date: string | null; related_module: string; related_project: string | null;
  assigned_to_name: string | null;
}

const isProject = (s: Schedule) =>
  String(s.related_module) === 'project' || String(s.related_project || '').trim() !== '';

export default function ProjectsOverviewPage() {
  const { data, loading, error, reload } = useZxQuery<{ schedules: Schedule[] }>('/api/work/schedules?scope=all');
  const rows = asArray<Schedule>(data, ['schedules']).filter(isProject);

  if (loading) return <ZxLoading label="Pulling project position…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  const open = rows.filter((r) => !['completed', 'cancelled'].includes(String(r.status)));
  const overdue = rows.filter((r) => String(r.status) === 'overdue');
  const done = rows.filter((r) => String(r.status) === 'completed');
  const projectNames = new Set(rows.map((r) => String(r.related_project || r.task_title || 'Untitled')).filter(Boolean));

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ZxKpi icon={Briefcase} label="Tracked projects" value={String(projectNames.size)} sub={`${rows.length} linked schedule lines`} />
        <ZxKpi icon={Clock} label="Open lines" value={String(open.length)} sub="Scheduled or in progress" />
        <ZxKpi icon={AlertTriangle} label="Overdue" value={String(overdue.length)} sub="Needs rescheduling" />
        <ZxKpi icon={CheckCircle2} label="Completed" value={String(done.length)} sub="Delivered lines" />
      </div>

      <div className="mt-4">
        <ZxSection title="Projects on the board" hint="Grouped by linked project — every line is a real schedule record">
          {rows.length === 0 ? (
            <ZxEmpty title="No projects yet" hint="Create one from the Projects tab — it persists as a linked schedule." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.slice(0, 10).map((r) => (
                <li key={String(r.id)} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{String(r.related_project || r.task_title || '—')}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {String(r.task_title || '')} · {String(r.assigned_to_name || 'unassigned')} · {String(r.status).replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{String(r.due_date || '').slice(0, 10) || 'no date'}</span>
                </li>
              ))}
            </ul>
          )}
        </ZxSection>
      </div>
    </>
  );
}
