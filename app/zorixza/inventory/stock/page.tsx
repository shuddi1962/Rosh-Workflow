'use client';

import React from 'react';
import { useZxQuery, asArray, ZxTable, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';

interface Item extends Record<string, unknown> {
  id: string; name: string; sku: string | null; quantity_on_hand: number; reorder_level: number; warehouse_id: string | null;
}

const COLUMNS: ZxColumn<Item>[] = [
  { key: 'name', label: 'Item', render: (i) => <span className="font-semibold text-slate-800">{String(i.name)}</span> },
  { key: 'sku', label: 'SKU', render: (i) => <span className="font-mono text-xs text-slate-500">{String(i.sku ?? '—')}</span> },
  { key: 'qty', label: 'On hand', align: 'right', render: (i) => {
    const qty = Number(i.quantity_on_hand || 0);
    const lowLine = qty <= Number(i.reorder_level || 0);
    return <span className={`font-extrabold tabular-nums ${lowLine ? 'text-red-600' : ''}`}>{qty}</span>;
  } },
];

export default function ZorixzaStockPage() {
  const { data, loading, error, reload } = useZxQuery<{ items: Item[] }>('/api/inventory?limit=500');
  const rows = asArray<Item>(data, ['items']);

  if (loading) return <ZxLoading label="Loading stock…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection title={`Stock lines (${rows.length})`} hint="Balances come from movements — read-only here">
      <ZxTable<Item>
        columns={COLUMNS}
        rows={rows}
        searchKeys={['name', 'sku']}
        searchPlaceholder="Search name or SKU…"
        emptyTitle="No stock lines"
        emptyHint="Receive goods or add products to populate inventory."
      />
    </ZxSection>
  );
}
