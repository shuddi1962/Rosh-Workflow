'use client';

import React from 'react';
import { useZxQuery, asArray, ZxTable, ZxBadge, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';

interface Schedule extends Record<string, unknown> {
  id: string; task_title: string; description: string | null; due_date: string | null;
  status: string; related_module: string | null;
}

const COLUMNS: ZxColumn<Schedule>[] = [
  { key: 'task', label: 'Task', render: (s) => (
    <span><span className="font-semibold text-slate-800">{String(s.task_title)}</span>
    {s.description && <span className="block text-xs text-slate-400 font-normal">{String(s.description).slice(0, 90)}</span>}</span>
  ) },
  { key: 'module', label: 'Module', render: (s) => <span className="text-slate-500">{String(s.related_module ?? '—')}</span> },
  { key: 'due', label: 'Due', render: (s) => <span className="text-slate-500 whitespace-nowrap">{String(s.due_date || '').slice(0, 10) || '—'}</span> },
  { key: 'status', label: 'Status', render: (s) => {
    const st = String(s.status);
    return <ZxBadge tone={st === 'completed' ? 'green' : st === 'overdue' ? 'red' : st === 'in_progress' ? 'blue' : 'amber'}>{st.replace(/_/g, ' ')}</ZxBadge>;
  } },
];

export default function ZorixzaSchedulesPage() {
  const { data, loading, error, reload } = useZxQuery<{ schedules: Schedule[] }>('/api/work/schedules?scope=team&limit=300');
  const rows = asArray<Schedule>(data, ['schedules']);

  if (loading) return <ZxLoading label="Loading schedules…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection title={`Team schedules (${rows.length})`} hint="Overdue is computed live from due dates">
      <ZxTable<Schedule>
        columns={COLUMNS}
        rows={rows}
        searchKeys={['task_title', 'description', 'related_module']}
        searchPlaceholder="Search tasks…"
        statusKey="status"
        statusOptions={[...new Set(rows.map((r) => String(r.status)))].sort()}
        emptyTitle="No scheduled work"
        emptyHint="New assignments from any module appear here."
      />
    </ZxSection>
  );
}
