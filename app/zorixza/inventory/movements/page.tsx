'use client';

import React from 'react';
import { useZxQuery, asArray, ZxTable, ZxBadge, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';

interface Movement extends Record<string, unknown> {
  id: string; product_id: string; movement_type: string; quantity: number;
  reference_number: string | null; warehouse_id: string | null; reason: string | null; created_at: string;
}

function fmtDate(v: string) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

const COLUMNS: ZxColumn<Movement>[] = [
  { key: 'at', label: 'Date', render: (m) => <span className="text-slate-500 whitespace-nowrap">{fmtDate(String(m.created_at || ''))}</span> },
  { key: 'type', label: 'Type', render: (m) => {
    const t = String(m.movement_type || '');
    const tone = ['received', 'returned', 'opening_balance'].includes(t) ? 'green' : ['issued', 'sold', 'damaged', 'lost'].includes(t) ? 'red' : 'slate';
    return <ZxBadge tone={tone as 'green' | 'red' | 'slate'}>{t.replace(/_/g, ' ') || '—'}</ZxBadge>;
  } },
  { key: 'qty', label: 'Qty', align: 'right', render: (m) => <span className="font-extrabold tabular-nums">{Number(m.quantity || 0)}</span> },
  { key: 'ref', label: 'Reference', render: (m) => <span className="font-mono text-xs text-slate-500">{String(m.reference_number ?? '—')}</span> },
  { key: 'reason', label: 'Reason', render: (m) => <span className="text-slate-500">{String(m.reason ?? '—')}</span> },
];

export default function ZorixzaMovementsPage() {
  const { data, loading, error, reload } = useZxQuery<{ movements: Movement[] }>('/api/inventory/movements?limit=300');
  const rows = asArray<Movement>(data, ['movements']);
  const types = [...new Set(rows.map((r) => String(r.movement_type || '')))].filter(Boolean).sort();

  if (loading) return <ZxLoading label="Loading movements…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection title={`Stock movements (${rows.length})`} hint="Every change carries source, user, reason and before/after balance">
      <ZxTable<Movement>
        columns={COLUMNS}
        rows={rows}
        searchKeys={['reference_number', 'reason', 'product_id']}
        searchPlaceholder="Search reference, reason, product…"
        statusKey="movement_type"
        statusOptions={types}
        emptyTitle="No movements yet"
        emptyHint="Receive, issue or transfer stock and the trail appears here."
      />
    </ZxSection>
  );
}
