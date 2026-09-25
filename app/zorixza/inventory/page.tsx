'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { zxFetch, AuthError } from '@/lib/zorixza/client';
import { ZxKpi, ZxSection, ZxLoading, ZxError, ZxEmpty, ZxPageHead } from '@/components/zorixza/ui';
import { Boxes, Warehouse as WarehouseIcon, TriangleAlert } from 'lucide-react';

interface Item extends Record<string, unknown> {
  id: string;
  name: string;
  sku: string | null;
  quantity_on_hand: number;
  reorder_level: number;
  warehouse_id: string | null;
}

interface Warehouse extends Record<string, unknown> {
  id: string;
  name: string;
  code: string;
}

export default function ZorixzaInventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, b] = await Promise.all([
        zxFetch<{ items: Item[] }>('/api/inventory?limit=500'),
        zxFetch<{ warehouses: Warehouse[] }>('/api/warehouses'),
      ]);
      setItems(a.items ?? []);
      setWarehouses(b.warehouses ?? []);
    } catch (e) {
      if (e instanceof AuthError) {
        router.replace('/login');
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const whName = useMemo(() => {
    const m = new Map<string, string>();
    for (const w of warehouses) m.set(String(w.id), String(w.name));
    return m;
  }, [warehouses]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((i) => `${String(i.name)} ${String(i.sku ?? '')}`.toLowerCase().includes(needle));
  }, [items, q]);

  const low = items.filter((i) => Number(i.quantity_on_hand || 0) <= Number(i.reorder_level || 0)).length;

  return (
    <>
      <ZxPageHead eyebrow="Zorixza · Inventory" title="Stock & Warehouses" desc="Live stock lines and warehouse network." />
      {loading ? (
        <ZxLoading label="Loading stock…" />
      ) : error ? (
        <ZxError message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <ZxKpi icon={Boxes} label="Stock lines" value={String(items.length)} />
            <ZxKpi icon={WarehouseIcon} label="Warehouses" value={String(warehouses.length)} sub={warehouses.map((w) => String(w.name)).slice(0, 3).join(' · ')} />
            <ZxKpi icon={TriangleAlert} label="At/below reorder" value={String(low)} />
          </div>
          <ZxSection title="Stock lines" hint={`${filtered.length} shown`}>
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 mb-4 max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU…" className="w-full text-sm focus:outline-none" />
            </div>
            {filtered.length === 0 ? (
              <ZxEmpty title="No stock lines" hint="Receive goods or add products to populate inventory." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="py-2 pr-3">Item</th>
                      <th className="py-2 pr-3">SKU</th>
                      <th className="py-2 pr-3">Warehouse</th>
                      <th className="py-2 text-right">On hand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.slice(0, 100).map((i) => {
                      const qty = Number(i.quantity_on_hand || 0);
                      const lowLine = qty <= Number(i.reorder_level || 0);
                      return (
                        <tr key={String(i.id)} className="hover:bg-slate-50">
                          <td className="py-2.5 pr-3 font-semibold text-slate-800">{String(i.name)}</td>
                          <td className="py-2.5 pr-3 text-slate-500 font-mono text-xs">{String(i.sku ?? '—')}</td>
                          <td className="py-2.5 pr-3 text-slate-500">{whName.get(String(i.warehouse_id ?? '')) ?? '—'}</td>
                          <td className={`py-2.5 text-right font-bold tabular-nums ${lowLine ? 'text-red-600' : ''}`}>{qty}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length > 100 && <p className="text-xs text-slate-400 mt-2">Showing first 100 of {filtered.length}.</p>}
              </div>
            )}
          </ZxSection>
        </>
      )}
    </>
  );
}
