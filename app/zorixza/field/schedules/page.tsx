'use client';

import React from 'react';
import { useZxQuery, asArray, ZxTable, ZxBadge, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';

interface Schedule extends Record<string, unknown> {
  id: string; task_title: string; status: string; priority: string;
  due_date: string | null; related_module: string;
  assigned_to_name: string | null; department: string | null;
}

function tone(s: string): 'green' | 'red' | 'amber' | 'blue' | 'slate' {
  if (s === 'completed') return 'green';
  if (s === 'overdue' || s === 'cancelled') return 'red';
  if (s === 'in_progress') return 'amber';
  return 'blue';
}

const COLUMNS: ZxColumn<Schedule>[] = [
  { key: 'task_title', label: 'Schedule', render: (r) => (
    <span><span className="font-semibold text-slate-800">{String(r.task_title || '—')}</span>
    <span className="block text-xs text-slate-400 font-normal">{String(r.related_module).replace(/_/g, ' ')}{r.department ? ` · ${String(r.department)}` : ''}</span></span>
  ) },
  { key: 'assigned_to_name', label: 'Owner', render: (r) => <span className="text-slate-500">{String(r.assigned_to_name ?? 'unassigned')}</span> },
  { key: 'due_date', label: 'Due', render: (r) => <span className="text-slate-500 whitespace-nowrap">{String(r.due_date || '').slice(0, 10) || '—'}</span> },
  { key: 'status', label: 'Status', render: (r) => <ZxBadge tone={tone(String(r.status))}>{String(r.status).replace(/_/g, ' ')}</ZxBadge> },
];

export default function FieldSchedulesPage() {
  const { data, loading, error, reload } = useZxQuery<{ schedules: Schedule[] }>('/api/work/schedules?scope=all');
  const rows = asArray<Schedule>(data, ['schedules']);

  if (loading) return <ZxLoading label="Loading team schedules…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection title={`Team schedules (${rows.length})`} hint="Every department's committed dates — managed from Operations">
      <ZxTable<Schedule>
        columns={COLUMNS}
        rows={rows}
        searchKeys={['task_title', 'assigned_to_name', 'department', 'status']}
        searchPlaceholder="Search schedules, owners, departments…"
        statusKey="status"
        emptyTitle="No schedules yet"
        emptyHint="Schedules are created across jobs, projects and operations and surface here."
      />
    </ZxSection>
  );
}
