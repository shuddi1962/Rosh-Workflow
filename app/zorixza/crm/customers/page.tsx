'use client';

import React, { useState } from 'react';
import { useZxQuery, asArray, ZxTable, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';
import { zxFetch, AuthError } from '@/lib/zorixza/client';
import { useRouter } from 'next/navigation';

interface Customer extends Record<string, unknown> {
  id: string; name: string; company: string | null; phone: string | null; email: string | null;
}

const COLUMNS: ZxColumn<Customer>[] = [
  { key: 'name', label: 'Name', render: (c) => <span className="font-semibold text-slate-800">{String(c.name || '—')}</span> },
  { key: 'company', label: 'Company', render: (c) => <span className="text-slate-500">{String(c.company ?? '—')}</span> },
  { key: 'phone', label: 'Phone', render: (c) => <span className="text-slate-500 tabular-nums">{String(c.phone ?? '—')}</span> },
  { key: 'email', label: 'Email', render: (c) => <span className="text-slate-500">{String(c.email ?? '—')}</span> },
];

export default function ZorixzaCustomersPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useZxQuery<{ customers: Customer[] }>('/api/directory/customers?limit=500');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [f, setF] = useState({ name: '', company: '', phone: '', email: '', address: '' });

  const rows = asArray<Customer>(data, ['customers']);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await zxFetch('/api/directory/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      setFormOpen(false);
      setF({ name: '', company: '', phone: '', email: '', address: '' });
      reload();
    } catch (err) {
      if (err instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setFormError(err instanceof Error ? err.message : 'Could not create customer');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ZxLoading label="Loading customers…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection title={`Customers (${rows.length})`} hint="Shared record — sales, invoices and jobs read this same table">
      <div className="flex justify-end mb-2">
        <button onClick={() => setFormOpen(true)} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-emerald-700 transition">
          + New customer
        </button>
      </div>
      {formOpen && (
        <form onSubmit={create} className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold text-slate-700">Name *
            <input value={f.name} onChange={set('name')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" placeholder="Customer or company name" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Company
            <input value={f.company} onChange={set('company')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
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
              {saving ? 'Saving…' : 'Create customer'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200">Cancel</button>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
          </div>
        </form>
      )}
      <ZxTable<Customer>
        columns={COLUMNS}
        rows={rows}
        searchKeys={['name', 'company', 'phone', 'email']}
        searchPlaceholder="Search customers…"
        emptyTitle="No customers yet"
        emptyHint="Create the first customer above — sales, invoices and jobs will read it."
      />
    </ZxSection>
  );
}
