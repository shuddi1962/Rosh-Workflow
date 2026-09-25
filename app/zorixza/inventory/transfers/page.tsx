'use client';

import React, { useMemo } from 'react';
import { useZxQuery, asArray, ZxTable, ZxBadge, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';

interface Transfer extends Record<string, unknown> {
  id: string; transfer_number: string; transfer_date: string;
  source_warehouse_id: string; destination_warehouse_id: string; status: string;
}
interface Warehouse extends Record<string, unknown> { id: string; name: string }

export default function ZorixzaTransfersPage() {
  const tr = useZxQuery<{ transfers: Transfer[] }>('/api/inventory/transfers?limit=300');
  const wh = useZxQuery<{ warehouses: Warehouse[] }>('/api/warehouses');

  const rows = asArray<Transfer>(tr.data, ['transfers']);
  const names = useMemo(() => {
    const m = new Map<string, string>();
    for (const w of asArray<Warehouse>(wh.data, ['warehouses'])) m.set(String(w.id), String(w.name));
    return m;
  }, [wh.data]);

  const columns: ZxColumn<Transfer>[] = [
    { key: 'no', label: 'Transfer', render: (t) => <span className="font-mono text-xs font-bold">{String(t.transfer_number || '—')}</span> },
    { key: 'date', label: 'Date', render: (t) => <span className="text-slate-500">{String(t.transfer_date || '').slice(0, 10) || '—'}</span> },
    { key: 'route', label: 'Route', render: (t) => (
      <span className="text-slate-600">
        {names.get(String(t.source_warehouse_id || '')) ?? '—'}
        <span className="text-slate-300"> → </span>
        {names.get(String(t.destination_warehouse_id || '')) ?? '—'}
      </span>
    ) },
    { key: 'status', label: 'Status', render: (t) => {
      const s = String(t.status || '').replace(/^transfer:/, '');
      return <ZxBadge tone={s === 'completed' ? 'green' : s === 'cancelled' ? 'red' : 'amber'}>{s.replace(/_/g, ' ') || '—'}</ZxBadge>;
    } },
  ];

  if (tr.loading || wh.loading) return <ZxLoading label="Loading transfers…" />;
  if (tr.error) return <ZxError message={tr.error} onRetry={() => { tr.reload(); wh.reload(); }} />;

  return (
    <ZxSection title={`Stock transfers (${rows.length})`} hint="Header + paired movements, fully auditable">
      <ZxTable<Transfer>
        columns={columns}
        rows={rows}
        searchKeys={['transfer_number']}
        searchPlaceholder="Search transfer number…"
        emptyTitle="No transfers yet"
        emptyHint="Transfers between warehouses will queue here with their movement pairs."
      />
    </ZxSection>
  );
}
