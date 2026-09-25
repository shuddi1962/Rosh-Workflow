'use client';

import React, { useState } from 'react';
import { useZxQuery, asArray, ZxTable, ZxBadge, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';
import { zxFetch, AuthError, fmtNaira } from '@/lib/zorixza/client';
import { useRouter } from 'next/navigation';

interface PO extends Record<string, unknown> {
  id: string; po_number: string; supplier: string; status: string;
  total_amount_naira: number; expected_date: string | null; created_at: string;
}

function tone(s: string): 'green' | 'red' | 'amber' | 'blue' | 'slate' {
  if (s === 'received' || s === 'closed') return 'green';
  if (s === 'cancelled') return 'red';
  if (s === 'sent' || s === 'partially_received') return 'amber';
  return 'blue';
}

const COLUMNS: ZxColumn<PO>[] = [
  { key: 'po_number', label: 'PO', render: (o) => (
    <span><span className="font-semibold text-slate-800">{String(o.po_number || '—')}</span>
    <span className="block text-xs text-slate-400 font-normal">{String(o.supplier || '—')}</span></span>
  ) },
  { key: 'status', label: 'Status', render: (o) => <ZxBadge tone={tone(String(o.status))}>{String(o.status).replace(/_/g, ' ')}</ZxBadge> },
  { key: 'expected_date', label: 'Expected', render: (o) => <span className="text-slate-500 whitespace-nowrap">{String(o.expected_date || '').slice(0, 10) || '—'}</span> },
  { key: 'total_amount_naira', label: 'Total', align: 'right', render: (o) => (
    <span className="font-bold text-slate-800 tabular-nums">{fmtNaira(Number(o.total_amount_naira || 0))}</span>
  ) },
];

export default function PurchasingOrdersPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useZxQuery<{ purchase_orders: PO[] }>('/api/inventory/purchase-orders');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [f, setF] = useState({ supplier: '', expected_date: '', total_amount_naira: '', notes: '' });

  const rows = asArray<PO>(data, ['purchase_orders']);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!f.supplier.trim()) {
      setFormError('Supplier is required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await zxFetch('/api/inventory/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier: f.supplier.trim(),
          expected_date: f.expected_date || undefined,
          total_amount_naira: Number(f.total_amount_naira || 0),
          notes: f.notes,
          items: [],
        }),
      });
      setFormOpen(false);
      setF({ supplier: '', expected_date: '', total_amount_naira: '', notes: '' });
      reload();
    } catch (err) {
      if (err instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setFormError(err instanceof Error ? err.message : 'Could not create purchase order');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ZxLoading label="Loading purchase orders…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection title={`Purchase orders (${rows.length})`} hint="Draft → sent → received — audited at creation">
      <div className="flex justify-end mb-2">
        <button onClick={() => setFormOpen(true)} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-emerald-700 transition">
          + New purchase order
        </button>
      </div>
      {formOpen && (
        <form onSubmit={create} className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 grid sm:grid-cols-2 gap-3">
          <label className="text-sm font-semibold text-slate-700">Supplier *
            <input value={f.supplier} onChange={set('supplier')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" placeholder="Must match a supplier record" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Expected date
            <input value={f.expected_date} onChange={set('expected_date')} type="date" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Total (₦)
            <input value={f.total_amount_naira} onChange={set('total_amount_naira')} type="number" min="0" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" placeholder="0" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Notes
            <input value={f.notes} onChange={set('notes')} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-normal bg-white" />
          </label>
          <div className="sm:col-span-2 flex items-center gap-2">
            <button disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Create purchase order'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200">Cancel</button>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
          </div>
        </form>
      )}
      <ZxTable<PO>
        columns={COLUMNS}
        rows={rows}
        searchKeys={['po_number', 'supplier', 'status']}
        searchPlaceholder="Search PO number, supplier…"
        statusKey="status"
        emptyTitle="No purchase orders yet"
        emptyHint="Raise the first PO above — receipts and bills follow it."
      />
    </ZxSection>
  );
}
