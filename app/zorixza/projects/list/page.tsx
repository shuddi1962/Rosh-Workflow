'use client';

import React, { useState } from 'react';
import { useZxQuery, asArray, ZxTable, ZxBadge, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';
import { zxFetch, AuthError } from '@/lib/zorixza/client';
import { useRouter } from 'next/navigation';

interface Schedule extends Record<string, unknown> {
  id: string; task_title: string; description: string | null; status: string; priority: string;
  due_date: string | null; related_module: string; related_project: string | null;
  assigned_to_name: string | null; department: string | null;
}

function tone(s: string): 'green' | 'red' | 'amber' | 'blue' | 'slate' {
  if (s === 'completed') return 'green';
  if (s === 'overdue' || s === 'cancelled') return 'red';
  if (s === 'in_progress') return 'amber';
  return 'blue';
}

const COLUMNS: ZxColumn<Schedule>[] = [
  { key: 'related_project', label: 'Project', render: (r) => (
    <span><span className="font-semibold text-slate-800">{String(r.related_project || r.task_title || '—')}</span>
    <span className="block text-xs text-slate-400 font-normal">{String(r.task_title || '')}</span></span>
  ) },
  { key: 'assigned_to_name', label: 'Owner', render: (r) => <span className="text-slate-500">{String(r.assigned_to_name ?? 'unassigned')}</span> },
  { key: 'due_date', label: 'Due', render: (r) => <span className="text-slate-500 whitespace-nowrap">{String(r.due_date || '').slice(0, 10) || '—'}</span> },
  { key: 'status', label: 'Status', render: (r) => <ZxBadge tone={tone(String(r.status))}>{String(r.status).replace(/_/g, ' ')}</ZxBadge> },
];

export default function ProjectsListPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useZxQuery<{ schedules: Schedule[] }>('/api/work/schedules?scope=all');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [f, setF] = useState({ related_project: '', task_title: '', due_date: '', priority: 'medium', department: '', description: '' });

  const rows = asArray<Schedule>(data, ['schedules']).filter(
    (r) => String(r.related_module) === 'project' || String(r.related_project || '').trim() !== ''
  );
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!f.related_project.trim() || !f.task_title.trim()) {
      setFormError('Project name and first milestone title are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await zxFetch('/api/work/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          related_module: 'project',
          related_project: f.related_project.trim(),
          title: f.task_title.trim(),
          due_date: f.due_date || undefined,
          priority: f.priority,
          department: f.department,
          description: f.description,
        }),
      });
      setFormOpen(false);
      setF({ related_project: '', task_title: '', due_date: '', priority: 'medium', department: '', description: '' });
      reload();
    } catch (err) {
      if (err instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setFormError(err instanceof Error ? err.message : 'Could not create project');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ZxLoading label="Loading projects…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection title={`Projects (${rows.length} tracked lines)`} hint="Each project persists as linked schedule lines — milestones, owners, dates">
      <div className="flex justify-end mb-2">
        <button onClick={() => setFormOpen(true)} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-emerald-700 transition">
          + New project
        </button>
      </div>
      {formOpen && (
        <form onSubmit={create} className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold text-slate-700">Project name *
            <input value={f.related_project} onChange={set('related_project')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" placeholder="e.g. GRA Estate CCTV rollout" />
          </label>
          <label className="text-sm font-semibold text-slate-700">First milestone *
            <input value={f.task_title} onChange={set('task_title')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" placeholder="e.g. Site survey complete" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Due date
            <input value={f.due_date} onChange={set('due_date')} type="date" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Priority
            <select value={f.priority} onChange={set('priority')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">Department
            <input value={f.department} onChange={set('department')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Notes
            <input value={f.description} onChange={set('description')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
          </label>
          <div className="sm:col-span-2 flex items-center gap-2">
            <button disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Create project'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200">Cancel</button>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
          </div>
        </form>
      )}
      <ZxTable<Schedule>
        columns={COLUMNS}
        rows={rows}
        searchKeys={['related_project', 'task_title', 'assigned_to_name', 'status']}
        searchPlaceholder="Search projects, milestones, owners…"
        statusKey="status"
        emptyTitle="No projects yet"
        emptyHint="Create the first project above — milestones, owners and dates persist as linked records."
      />
    </ZxSection>
  );
}
