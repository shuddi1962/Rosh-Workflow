'use client';

import React, { useState } from 'react';
import { useZxQuery, asArray, ZxTable, ZxBadge, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';
import { zxFetch, AuthError } from '@/lib/zorixza/client';
import { useRouter } from 'next/navigation';

interface Lead extends Record<string, unknown> {
  id: string; full_name: string; company: string | null; phone: string;
  email: string | null; stage: string; score: number;
}

const STAGES = ['new_lead', 'qualified', 'contacted', 'interested', 'quote_sent', 'negotiation', 'customer', 'lost'];

const COLUMNS: ZxColumn<Lead>[] = [
  { key: 'name', label: 'Name', render: (l) => <span className="font-semibold text-slate-800">{String(l.full_name || '—')}</span> },
  { key: 'company', label: 'Company', render: (l) => <span className="text-slate-500">{String(l.company ?? '—')}</span> },
  { key: 'phone', label: 'Phone', render: (l) => <span className="text-slate-500 tabular-nums">{String(l.phone || '—')}</span> },
  { key: 'stage', label: 'Stage', render: (l) => <ZxBadge tone={String(l.stage) === 'customer' ? 'green' : String(l.stage) === 'lost' ? 'red' : 'slate'}>{String(l.stage).replace(/_/g, ' ')}</ZxBadge> },
  { key: 'score', label: 'Score', align: 'right', render: (l) => <span className="font-bold tabular-nums">{Number(l.score || 0)}</span> },
];

export default function ZorixzaLeadsPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useZxQuery<{ leads: Lead[]; total: number }>('/api/crm/leads?limit=200');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [f, setF] = useState({ full_name: '', phone: '', company: '', email: '', stage: 'new_lead' });

  const rows = asArray<Lead>(data, ['leads']);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!f.full_name.trim() || !f.phone.trim()) {
      setFormError('Full name and phone are required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await zxFetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, division_interest: 'both' }),
      });
      setFormOpen(false);
      setF({ full_name: '', phone: '', company: '', email: '', stage: 'new_lead' });
      reload();
    } catch (err) {
      if (err instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setFormError(err instanceof Error ? err.message : 'Could not create lead');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ZxLoading label="Loading leads…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection
      title={`Leads (${rows.length})`}
      hint="Validated server-side; every create is audited"
    >
      <div className="flex justify-end mb-2">
        <button onClick={() => setFormOpen(true)} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-emerald-700 transition">
          + New lead
        </button>
      </div>
      {formOpen && (
        <form onSubmit={create} className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold text-slate-700">Full name *
            <input value={f.full_name} onChange={set('full_name')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" placeholder="e.g. Tamuno Briggs" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Phone *
            <input value={f.phone} onChange={set('phone')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" placeholder="0803…" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Company
            <input value={f.company} onChange={set('company')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Email
            <input value={f.email} onChange={set('email')} type="email" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Stage
            <select value={f.stage} onChange={set('stage')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white">
              {STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
          <div className="sm:col-span-2 flex items-center gap-2">
            <button disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Create lead'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200">Cancel</button>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
          </div>
        </form>
      )}
      <ZxTable<Lead>
        columns={COLUMNS}
        rows={rows}
        searchKeys={['full_name', 'company', 'phone', 'email']}
        searchPlaceholder="Search name, company, phone…"
        statusKey="stage"
        statusOptions={STAGES}
        emptyTitle="No leads found"
        emptyHint="Create the first lead above — it persists to the CRM service."
      />
    </ZxSection>
  );
}
