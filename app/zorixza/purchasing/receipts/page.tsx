'use client';

import React from 'react';
import { useZxQuery, asArray, ZxTable, ZxBadge, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';

interface GRN extends Record<string, unknown> {
  id: string; grn_number: string; supplier: string; purchase_order_ref: string | null;
  verification_status: string; received_date: string | null; received_by: string | null;
  items: Array<Record<string, unknown>>;
}

function tone(s: string): 'green' | 'red' | 'amber' | 'blue' | 'slate' {
  if (s === 'verified') return 'green';
  if (s === 'rejected') return 'red';
  if (s === 'pending') return 'amber';
  return 'blue';
}

const COLUMNS: ZxColumn<GRN>[] = [
  { key: 'grn_number', label: 'GRN', render: (g) => (
    <span><span className="font-semibold text-slate-800">{String(g.grn_number || '—')}</span>
    <span className="block text-xs text-slate-400 font-normal">{String(g.supplier || '—')}{g.purchase_order_ref ? ` · ${String(g.purchase_order_ref)}` : ''}</span></span>
  ) },
  { key: 'items', label: 'Lines', render: (g) => (
    <span className="text-slate-500 tabular-nums">{Array.isArray(g.items) ? g.items.length : 0}</span>
  ) },
  { key: 'received_by', label: 'Received by', render: (g) => <span className="text-slate-500">{String(g.received_by ?? '—')}</span> },
  { key: 'received_date', label: 'Date', render: (g) => <span className="text-slate-500 whitespace-nowrap">{String(g.received_date || '').slice(0, 10) || '—'}</span> },
  { key: 'verification_status', label: 'Verification', render: (g) => <ZxBadge tone={tone(String(g.verification_status))}>{String(g.verification_status).replace(/_/g, ' ')}</ZxBadge> },
];

export default function PurchasingReceiptsPage() {
  const { data, loading, error, reload } = useZxQuery<{ goods_receipts: GRN[] }>('/api/inventory/goods-receipts');
  const rows = asArray<GRN>(data, ['goods_receipts']);

  if (loading) return <ZxLoading label="Loading goods receipts…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection title={`Goods receipts (${rows.length})`} hint="Accepted quantities post into stock — damaged lines never do">
      <ZxTable<GRN>
        columns={COLUMNS}
        rows={rows}
        searchKeys={['grn_number', 'supplier', 'purchase_order_ref', 'received_by']}
        searchPlaceholder="Search GRN, PO ref, supplier…"
        statusKey="verification_status"
        emptyTitle="No goods receipts yet"
        emptyHint="Receipts are created against purchase orders and post accepted stock automatically."
      />
    </ZxSection>
  );
}
