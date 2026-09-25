'use client';

import React, { useMemo, useState } from 'react';
import { useZxQuery, asArray, ZxTable, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';
import { zxFetch, AuthError } from '@/lib/zorixza/client';
import { useRouter } from 'next/navigation';

interface Warehouse extends Record<string, unknown> { id: string; name: string; code: string; address: string | null }
interface Item extends Record<string, unknown> { id: string; warehouse_id: string | null }

export default function ZorixzaWarehousesPage() {
  const router = useRouter();
  const wh = useZxQuery<{ warehouses: Warehouse[] }>('/api/warehouses');
  const items = useZxQuery<{ items: Item[] }>('/api/inventory?limit=1000');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const rows = asArray<Warehouse>(wh.data, ['warehouses']);
  const stock = asArray<Item>(items.data, ['items']);

  const linesByWh = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of stock) {
      const k = String(i.warehouse_id ?? '');
      m.set(k, (m.get(k) || 0) + 1);
    }
    return m;
  }, [stock]);

  const columns: ZxColumn<Warehouse>[] = [
    { key: 'name', label: 'Warehouse', render: (w) => <span className="font-semibold text-slate-800">{String(w.name)}</span> },
    { key: 'code', label: 'Code', render: (w) => <span className="font-mono text-xs text-slate-500">{String(w.code ?? '—')}</span> },
    { key: 'address', label: 'Address', render: (w) => <span className="text-slate-500">{String(w.address ?? '—')}</span> },
    { key: 'lines', label: 'Stock lines', align: 'right', render: (w) => <span className="font-extrabold tabular-nums">{linesByWh.get(String(w.id)) ?? 0}</span> },
  ];

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Warehouse name is required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await zxFetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), address: address.trim() }),
      });
      setFormOpen(false);
      setName('');
      setAddress('');
      wh.reload();
    } catch (err) {
      if (err instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setFormError(err instanceof Error ? err.message : 'Could not create warehouse');
    } finally {
      setSaving(false);
    }
  }

  if (wh.loading || items.loading) return <ZxLoading label="Loading warehouses…" />;
  if (wh.error) return <ZxError message={wh.error} onRetry={() => { wh.reload(); items.reload(); }} />;

  return (
    <ZxSection title={`Warehouses (${rows.length})`} hint="Creation is validated and audited server-side">
      <div className="flex justify-end mb-2">
        <button onClick={() => setFormOpen(true)} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-emerald-700 transition">
          + New warehouse
        </button>
      </div>
      {formOpen && (
        <form onSubmit={create} className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold text-slate-700">Name *
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" placeholder="e.g. Port Harcourt Main" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Address
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
          </label>
          <div className="sm:col-span-2 flex items-center gap-2">
            <button disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Create warehouse'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200">Cancel</button>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
          </div>
        </form>
      )}
      <ZxTable<Warehouse>
        columns={columns}
        rows={rows}
        searchKeys={['name', 'code', 'address']}
        searchPlaceholder="Search warehouses…"
        emptyTitle="No warehouses yet"
        emptyHint="Create the first warehouse above."
      />
    </ZxSection>
  );
}
