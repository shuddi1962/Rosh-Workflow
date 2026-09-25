'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, Warehouse as WhIcon, TriangleAlert, ArrowRight } from 'lucide-react';
import { useZxQuery, asArray } from '@/components/zorixza/data';
import { ZxKpi, ZxSection, ZxLoading, ZxError, ZxEmpty } from '@/components/zorixza/ui';

interface Item extends Record<string, unknown> { id: string; name: string; quantity_on_hand: number; reorder_level: number }
interface Movement extends Record<string, unknown> { id: string; product_id: string; movement_type: string; quantity: number; created_at: string; reference_number: string }
interface Warehouse extends Record<string, unknown> { id: string; name: string }

export default function ZorixzaInventoryDashboard() {
  const router = useRouter();
  const items = useZxQuery<{ items: Item[] }>('/api/inventory?limit=500');
  const wh = useZxQuery<{ warehouses: Warehouse[] }>('/api/warehouses');
  const mov = useZxQuery<{ movements: Movement[] }>('/api/inventory/movements?limit=50');

  if (items.loading || wh.loading || mov.loading) return <ZxLoading label="Loading inventory…" />;
  if (items.error) return <ZxError message={items.error} onRetry={() => { items.reload(); wh.reload(); mov.reload(); }} />;

  const stock = asArray<Item>(items.data, ['items']);
  const low = stock.filter((i) => Number(i.quantity_on_hand || 0) <= Number(i.reorder_level || 0));
  const recent = asArray<Movement>(mov.data, ['movements']).slice(0, 6);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <ZxKpi icon={Boxes} label="Stock lines" value={String(stock.length)} />
        <ZxKpi icon={WhIcon} label="Warehouses" value={String(asArray(wh.data, ['warehouses']).length)} />
        <ZxKpi icon={TriangleAlert} label="At/below reorder" value={String(low.length)} />
        <ZxKpi icon={Boxes} label="Movements tracked" value={String(asArray(mov.data, ['movements']).length)} sub="last 50 shown" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <ZxSection title="Needs reorder" hint={`${low.length} lines`}>
          {low.length === 0 ? <ZxEmpty title="Stock levels healthy" /> : (
            <ul className="divide-y divide-slate-100">
              {low.slice(0, 6).map((i) => (
                <li key={String(i.id)} className="py-2 flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-800 flex-1 truncate">{String(i.name)}</span>
                  <span className="text-sm font-extrabold text-red-600 tabular-nums">{Number(i.quantity_on_hand || 0)}</span>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => router.push('/zorixza/inventory/stock')} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:gap-2.5 transition-all">
            Open Stock <ArrowRight className="w-4 h-4" />
          </button>
        </ZxSection>
        <ZxSection title="Latest movements" hint="Auditable trail">
          {recent.length === 0 ? <ZxEmpty title="No movements yet" /> : (
            <ul className="divide-y divide-slate-100">
              {recent.map((m) => (
                <li key={String(m.id)} className="py-2 flex items-center gap-3 text-sm">
                  <span className="font-bold text-slate-700 capitalize">{String(m.movement_type).replace(/_/g, ' ')}</span>
                  <span className="text-slate-400 truncate flex-1">ref {String(m.reference_number || '—')}</span>
                  <span className="font-extrabold tabular-nums">×{Number(m.quantity || 0)}</span>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => router.push('/zorixza/inventory/movements')} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:gap-2.5 transition-all">
            Open Movements <ArrowRight className="w-4 h-4" />
          </button>
        </ZxSection>
      </div>
    </>
  );
}
