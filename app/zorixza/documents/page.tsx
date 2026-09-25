'use client';

import React from 'react';
import { useZxQuery, asArray, ZxTable, ZxBadge, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';
import { fmtNaira } from '@/lib/zorixza/client';

interface Receipt extends Record<string, unknown> {
  id: string; receipt_code: string | null; supplier_vendor: string | null;
  amount_naira: number; status: string; current_holder: string | null;
}

const COLUMNS: ZxColumn<Receipt>[] = [
  { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs font-semibold">{String(r.receipt_code ?? '—')}</span> },
  { key: 'vendor', label: 'Vendor', render: (r) => <span className="text-slate-600">{String(r.supplier_vendor ?? '—')}</span> },
  { key: 'amount', label: 'Amount', align: 'right', render: (r) => <span className="font-bold tabular-nums">{fmtNaira(Number(r.amount_naira || 0))}</span> },
  { key: 'holder', label: 'Holder', render: (r) => <span className="text-slate-500">{String(r.current_holder ?? '—')}</span> },
  { key: 'status', label: 'Status', render: (r) => <ZxBadge>{String(r.status).replace(/_/g, ' ')}</ZxBadge> },
];

export default function ZorixzaCustodyPage() {
  const { data, loading, error, reload } = useZxQuery<unknown>('/api/documents/receipts?limit=200');
  const rows = asArray<Receipt>(data, ['receipts']);
  const statuses = [...new Set(rows.map((r) => String(r.status)))].sort();

  if (loading) return <ZxLoading label="Loading custody records…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection title={`Receipt custody (${rows.length})`} hint="Who holds what, and what needs verification">
      <ZxTable<Receipt>
        columns={COLUMNS}
        rows={rows}
        searchKeys={['receipt_code', 'supplier_vendor', 'current_holder']}
        searchPlaceholder="Search code, vendor, holder…"
        statusKey="status"
        statusOptions={statuses}
        emptyTitle="No custody records"
        emptyHint="Recorded receipts appear here with holder and status."
      />
    </ZxSection>
  );
}
