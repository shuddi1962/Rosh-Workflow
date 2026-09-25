'use client';

import React from 'react';
import { Users, FileText, PackageCheck } from 'lucide-react';
import { useZxQuery, asArray } from '@/components/zorixza/data';
import { ZxKpi, ZxSection, ZxLoading, ZxError, ZxEmpty } from '@/components/zorixza/ui';
import { fmtNaira } from '@/lib/zorixza/client';

interface Supplier extends Record<string, unknown> { id: string; name: string; }
interface PO extends Record<string, unknown> { id: string; po_number: string; supplier: string; status: string; total_amount_naira: number; }
interface GRN extends Record<string, unknown> { id: string; grn_number: string; supplier: string; verification_status: string; }

export default function PurchasingOverviewPage() {
  const sup = useZxQuery<{ suppliers: Supplier[] }>('/api/directory/suppliers?limit=500');
  const pos = useZxQuery<{ purchase_orders: PO[] }>('/api/inventory/purchase-orders');
  const grn = useZxQuery<{ goods_receipts: GRN[] }>('/api/inventory/goods-receipts');

  if (sup.loading || pos.loading || grn.loading) return <ZxLoading label="Pulling purchasing position…" />;
  const err = sup.error || pos.error || grn.error;
  if (err) return <ZxError message={err} onRetry={() => { sup.reload(); pos.reload(); grn.reload(); }} />;

  const suppliers = asArray<Supplier>(sup.data, ['suppliers']);
  const orders = asArray<PO>(pos.data, ['purchase_orders']);
  const receipts = asArray<GRN>(grn.data, ['goods_receipts']);

  const openOrders = orders.filter((o) => !['received', 'cancelled', 'closed'].includes(String(o.status)));
  const openValue = openOrders.reduce((s, o) => s + Number(o.total_amount_naira || 0), 0);
  const pendingGrn = receipts.filter((g) => String(g.verification_status) !== 'verified').length;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ZxKpi icon={Users} label="Active suppliers" value={String(suppliers.length)} sub="Shared directory record" />
        <ZxKpi icon={FileText} label="Open purchase orders" value={String(openOrders.length)} sub={fmtNaira(openValue)} />
        <ZxKpi icon={PackageCheck} label="Goods receipts" value={String(receipts.length)} sub={`${pendingGrn} awaiting verification`} />
        <ZxKpi icon={FileText} label="Total POs" value={String(orders.length)} sub="All states, all time" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <ZxSection title="Open purchase orders" hint="Draft → sent → partially received">
          {openOrders.length === 0 ? (
            <ZxEmpty title="No open orders" hint="Create a purchase order from the Purchase Orders tab." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {openOrders.slice(0, 8).map((o) => (
                <li key={String(o.id)} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{String(o.po_number || '—')}</p>
                    <p className="text-xs text-slate-500 truncate">{String(o.supplier || '—')} · {String(o.status).replace(/_/g, ' ')}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700 tabular-nums shrink-0">{fmtNaira(Number(o.total_amount_naira || 0))}</span>
                </li>
              ))}
            </ul>
          )}
        </ZxSection>

        <ZxSection title="Latest goods receipts" hint="PO → received → inspection → stock">
          {receipts.length === 0 ? (
            <ZxEmpty title="No receipts yet" hint="Goods receipts post accepted quantities into stock." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {receipts.slice(0, 8).map((g) => (
                <li key={String(g.id)} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{String(g.grn_number || '—')}</p>
                    <p className="text-xs text-slate-500 truncate">{String(g.supplier || '—')}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 shrink-0">{String(g.verification_status).replace(/_/g, ' ')}</span>
                </li>
              ))}
            </ul>
          )}
        </ZxSection>
      </div>
    </>
  );
}
