'use client';

import React, { useState } from 'react';
import { useZxQuery, asArray, ZxTable, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';
import { zxFetch, AuthError } from '@/lib/zorixza/client';
import { useRouter } from 'next/navigation';

interface Supplier extends Record<string, unknown> {
  id: string; name: string; contact_person: string | null; phone: string | null; email: string | null; address: string | null;
}

const COLUMNS: ZxColumn<Supplier>[] = [
  { key: 'name', label: 'Supplier', render: (s) => <span className="font-semibold text-slate-800">{String(s.name || '—')}</span> },
  { key: 'contact_person', label: 'Contact', render: (s) => <span className="text-slate-500">{String(s.contact_person ?? '—')}</span> },
  { key: 'phone', label: 'Phone', render: (s) => <span className="text-slate-500 tabular-nums">{String(s.phone ?? '—')}</span> },
  { key: 'email', label: 'Email', render: (s) => <span className="text-slate-500">{String(s.email ?? '—')}</span> },
];

export default function PurchasingSuppliersPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useZxQuery<{ suppliers: Supplier[] }>('/api/directory/suppliers?limit=500');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [f, setF] = useState({ name: '', contact_person: '', phone: '', email: '', address: '' });

  const rows = asArray<Supplier>(data, ['suppliers']);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) {
      setFormError('Supplier name is required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await zxFetch('/api/directory/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      setFormOpen(false);
      setF({ name: '', contact_person: '', phone: '', email: '', address: '' });
      reload();
    } catch (err) {
      if (err instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setFormError(err instanceof Error ? err.message : 'Could not create supplier');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ZxLoading label="Loading suppliers…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection title={`Suppliers (${rows.length})`} hint="Shared record — POs, receipts and bills read this same table">
      <div className="flex justify-end mb-2">
        <button onClick={() => setFormOpen(true)} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-emerald-700 transition">
          + New supplier
        </button>
      </div>
      {formOpen && (
        <form onSubmit={create} className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold text-slate-700">Name *
            <input value={f.name} onChange={set('name')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" placeholder="Supplier or company name" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Contact person
            <input value={f.contact_person} onChange={set('contact_person')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Phone
            <input value={f.phone} onChange={set('phone')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Email
            <input value={f.email} onChange={set('email')} type="email" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
          </label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Address
            <input value={f.address} onChange={set('address')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
          </label>
          <div className="sm:col-span-2 flex items-center gap-2">
            <button disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Create supplier'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200">Cancel</button>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
          </div>
        </form>
      )}
      <ZxTable<Supplier>
        columns={COLUMNS}
        rows={rows}
        searchKeys={['name', 'contact_person', 'phone', 'email']}
        searchPlaceholder="Search suppliers…"
        emptyTitle="No suppliers yet"
        emptyHint="Create the first supplier above — POs and receipts will read it."
      />
    </ZxSection>
  );
}
