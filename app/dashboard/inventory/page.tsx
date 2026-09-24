'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Package, Warehouse, ArrowLeftRight, ClipboardCheck, Plus, Search, Download } from 'lucide-react'
import { naira } from '@/lib/operations/types'
import { downloadExport } from '@/lib/operations/client'
import { RecordAttachments } from '@/components/drive/RecordAttachments'

interface Item {
  id: string
  sku?: string
  name: string
  brand: string
  category: string
  division: string
  quantity_on_hand: number
  reorder_level: number
  cost_price_naira?: number | null
  price_naira?: number | null
  price_display?: string
  supplier?: string
  stock_value_cost?: number
}

interface WarehouseRow { id: string; code: string; name: string }
interface Movement {
  id: string; reference_number: string; movement_type: string; product_id: string
  quantity: number; previous_quantity: number; new_quantity: number
  reason: string; person_responsible: string; created_at: string
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export default function InventoryPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'items' | 'movements' | 'grn' | 'transfers' | 'warehouses'>('items')
  const [items, setItems] = useState<Item[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([])
  const [grns, setGrns] = useState<Array<Record<string, unknown>>>([])
  const [transfers, setTransfers] = useState<Array<Record<string, unknown>>>([])
  const [pos, setPos] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [division, setDivision] = useState('all')
  const [lowOnly, setLowOnly] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showGrnModal, setShowGrnModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [inv, mov, wh, grn, trf, po] = await Promise.all([
        fetch(`/api/inventory?search=${encodeURIComponent(search)}&division=${division === 'all' ? '' : division}${lowOnly ? '&low_stock=true' : ''}`, { headers: authHeaders() }).then((r) => r.json()),
        fetch('/api/inventory/movements?limit=200', { headers: authHeaders() }).then((r) => r.json()),
        fetch('/api/warehouses', { headers: authHeaders() }).then((r) => r.json()),
        fetch('/api/inventory/goods-receipts', { headers: authHeaders() }).then((r) => r.json()),
        fetch('/api/inventory/transfers', { headers: authHeaders() }).then((r) => r.json()),
        fetch('/api/inventory/purchase-orders', { headers: authHeaders() }).then((r) => r.json()),
      ])
      setItems(inv.items || [])
      setMovements(mov.records || mov.movements || [])
      setWarehouses(wh.warehouses || [])
      setGrns(grn.goods_receipts || [])
      setTransfers(trf.transfers || [])
      setPos(po.purchase_orders || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submitItem = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/inventory', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ ...form, price_naira: form.price_naira ? Number(form.price_naira) : null, cost_price_naira: form.cost_price_naira ? Number(form.cost_price_naira) : null, quantity_on_hand: Number(form.quantity_on_hand || 0), reorder_level: Number(form.reorder_level || 0), division: form.division || 'marine', category: form.category || 'General' }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setShowItemModal(false); setForm({}); load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }

  const submitMovement = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/inventory/movements', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ ...form, quantity: Number(form.quantity || 0) }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setShowMoveModal(false); setForm({}); load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }

  const submitGrn = async () => {
    setSaving(true)
    try {
      const productId = form.product_id
      const received = Number(form.received_quantity || 0)
      const damaged = Number(form.damaged_quantity || 0)
      const res = await fetch('/api/inventory/goods-receipts', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ supplier: form.supplier, warehouse_id: form.warehouse_id || null, purchase_order_ref: form.purchase_order_ref || '', notes: form.notes || '', items: [{ product_id: productId, ordered_quantity: received, received_quantity: received, damaged_quantity: damaged }] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setShowGrnModal(false); setForm({}); load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }

  const submitTransfer = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/inventory/transfers', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ source_warehouse_id: form.source_warehouse_id, destination_warehouse_id: form.destination_warehouse_id, notes: form.notes || '', items: [{ product_id: form.product_id, quantity: Number(form.quantity || 0) }] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setShowTransferModal(false); setForm({}); load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }

  const transferAction = async (id: string, action: string) => {
    const res = await fetch(`/api/inventory/transfers/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action }) })
    const data = await res.json()
    if (!res.ok) setError(data.error || 'Failed')
    else load()
  }

  const totalValue = items.reduce((s, i) => s + (i.stock_value_cost || 0), 0)
  const lowCount = items.filter((i) => Number(i.quantity_on_hand || 0) <= Number(i.reorder_level || 0)).length

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>

  return (
    <div>
      <PageHeader
        eyebrow="Operations · Inventory"
        title="Inventory & Warehouse"
        description="Real stock balances, auditable movements, goods receiving and warehouse transfers."
        actions={
          <>
            <Button variant="outline" onClick={() => downloadExport('inventory').catch((e) => setError(e instanceof Error ? e.message : 'Export failed'))}><Download className="w-4 h-4 mr-2" />Export</Button>
            <Button variant="outline" onClick={() => { setForm({}); setShowMoveModal(true) }}><ArrowLeftRight className="w-4 h-4 mr-2" />Record Movement</Button>
            <Button onClick={() => { setForm({}); setShowItemModal(true) }} className="bg-accent-primary text-white"><Plus className="w-4 h-4 mr-2" />Add Item</Button>
          </>
        }
      />
      {error && <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red mb-4 text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'SKUs', value: String(items.length) },
          { label: 'Stock value (cost)', value: naira(totalValue) },
          { label: 'Low stock', value: String(lowCount) },
          { label: 'Warehouses', value: String(warehouses.length) },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-border-subtle p-4">
            <p className="text-xs text-text-secondary">{k.label}</p>
            <p className="text-xl font-bold font-mono text-text-primary">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['items', 'movements', 'grn', 'transfers', 'warehouses'] as const).map((t) => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)} className="capitalize">{t === 'grn' ? 'Goods Receipts' : t}</Button>
        ))}
      </div>

      {tab === 'items' && (
        <>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input placeholder="Search SKU, name, brand..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} className="pl-10" />
            </div>
            <Select value={division} onValueChange={setDivision}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All divisions</SelectItem><SelectItem value="marine">Marine</SelectItem><SelectItem value="tech">Tech</SelectItem></SelectContent></Select>
            <Button variant="outline" onClick={() => { setLowOnly(!lowOnly); setTimeout(load, 0) }}>{lowOnly ? 'Show all' : 'Low stock only'}</Button>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </div>
          <div className="bg-white rounded-xl border border-border-subtle overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead><tr className="text-left text-text-muted border-b border-border-subtle"><th className="p-3">SKU / Product</th><th className="p-3">Division</th><th className="p-3 text-right">On hand</th><th className="p-3 text-right">Reorder</th><th className="p-3 text-right">Value</th><th className="p-3">Supplier</th></tr></thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-border-ghost hover:bg-bg-surface/50">
                    <td className="p-3"><p className="font-medium text-text-primary">{i.name}</p><p className="text-xs text-text-muted">{i.sku || '—'} · {i.brand} · {i.category}</p></td>
                    <td className="p-3"><Badge>{i.division}</Badge></td>
                    <td className="p-3 text-right font-mono">{i.quantity_on_hand}</td>
                    <td className="p-3 text-right font-mono">{i.reorder_level}</td>
                    <td className="p-3 text-right font-mono">{naira(i.stock_value_cost || 0)}</td>
                    <td className="p-3 text-text-secondary">{i.supplier || '—'}</td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-text-muted">No items. Add your first inventory item.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'movements' && (
        <div className="bg-white rounded-xl border border-border-subtle overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead><tr className="text-left text-text-muted border-b border-border-subtle"><th className="p-3">Reference</th><th className="p-3">Type</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Prev → New</th><th className="p-3">By</th><th className="p-3">Date</th></tr></thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="border-b border-border-ghost"><td className="p-3 font-mono">{m.reference_number}</td><td className="p-3"><Badge>{m.movement_type}</Badge></td><td className="p-3 text-right font-mono">{m.quantity}</td><td className="p-3 text-right font-mono">{m.previous_quantity} → {m.new_quantity}</td><td className="p-3">{m.person_responsible}</td><td className="p-3 text-text-muted">{String(m.created_at).slice(0, 16).replace('T', ' ')}</td></tr>
              ))}
              {movements.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-text-muted">No movements yet. Every stock change is recorded here.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'grn' && (
        <>
          <Button className="mb-4 bg-accent-primary text-white" onClick={() => { setForm({}); setShowGrnModal(true) }}><ClipboardCheck className="w-4 h-4 mr-2" />New Goods Receipt</Button>
          <div className="space-y-3">
            {grns.map((g) => (
              <div key={String(g.id)} className="bg-white rounded-xl border border-border-subtle p-4 flex flex-col gap-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                  <div><p className="font-medium">{String(g.grn_number)} · {String(g.supplier)}</p><p className="text-xs text-text-muted">PO: {String(g.purchase_order_ref || '—')} · Status: {String(g.verification_status)} · Stock posted: {g.stock_posted ? 'Yes' : 'No'} · {String(g.created_at).slice(0, 10)}</p></div>
                  <Badge>{(g.items as unknown[])?.length || 0} lines</Badge>
                </div>
                <RecordAttachments entityType="goods_receipt" entityId={String(g.id)} compact />
              </div>
            ))}
            {grns.length === 0 && <p className="text-text-muted text-sm">No goods receipts yet. Record one when supplier goods arrive.</p>}
          </div>
        </>
      )}

      {tab === 'transfers' && (
        <>
          <Button className="mb-4 bg-accent-primary text-white" onClick={() => { setForm({}); setShowTransferModal(true) }}><Plus className="w-4 h-4 mr-2" />New Transfer</Button>
          <div className="space-y-3">
            {transfers.map((t) => {
              const r = t as Record<string, unknown>
              return (
                <div key={String(r.id)} className="bg-white rounded-xl border border-border-subtle p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div><p className="font-medium">{String(r.transfer_number)} · {String(r.status)}</p><p className="text-xs text-text-muted">Requested by {String(r.requested_by)} · {String(r.created_at).slice(0, 10)}</p></div>
                    <div className="flex gap-2 flex-wrap">
                      {String(r.status) === 'requested' && <Button size="sm" onClick={() => transferAction(String(r.id), 'approve')}>Approve</Button>}
                      {String(r.status) === 'approved' && <Button size="sm" onClick={() => transferAction(String(r.id), 'dispatch')}>Dispatch</Button>}
                      {String(r.status) === 'in_transit' && <Button size="sm" onClick={() => transferAction(String(r.id), 'receive')}>Mark Received</Button>}
                    </div>
                  </div>
                </div>
              )
            })}
            {transfers.length === 0 && <p className="text-text-muted text-sm">No transfers yet. Destination stock only increases on receipt.</p>}
          </div>
        </>
      )}

      {tab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((w) => (
            <div key={w.id} className="bg-white rounded-xl border border-border-subtle p-4"><div className="flex items-center gap-2 mb-1"><Warehouse className="w-4 h-4 text-accent-primary" /><p className="font-medium">{w.name}</p></div><p className="text-xs text-text-muted font-mono">{w.code}</p></div>
          ))}
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowItemModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Add inventory item</h3>
            {[['name', 'Product name*'], ['sku', 'SKU code'], ['brand', 'Brand'], ['category', 'Category'], ['supplier', 'Supplier'], ['quantity_on_hand', 'Opening quantity'], ['reorder_level', 'Reorder level'], ['cost_price_naira', 'Cost price ₦'], ['price_naira', 'Selling price ₦']].map(([k, label]) => (
              <div key={k}><label className="text-xs text-text-secondary">{label}</label><Input value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
            <div><label className="text-xs text-text-secondary">Division</label><Select value={form.division || 'marine'} onValueChange={(v) => setForm({ ...form, division: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="marine">Marine</SelectItem><SelectItem value="tech">Tech</SelectItem></SelectContent></Select></div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowItemModal(false)}>Cancel</Button><Button disabled={saving} onClick={submitItem} className="bg-accent-primary text-white">{saving ? 'Saving...' : 'Save'}</Button></div>
          </div>
        </div>
      )}

      {showMoveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMoveModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Record stock movement</h3>
            <div><label className="text-xs text-text-secondary">Product</label><Select value={form.product_id || ''} onValueChange={(v) => setForm({ ...form, product_id: v })}><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent>{items.map((i) => <SelectItem key={i.id} value={i.id}>{i.name} ({i.quantity_on_hand})</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-xs text-text-secondary">Movement type</label><Select value={form.movement_type || 'received'} onValueChange={(v) => setForm({ ...form, movement_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['received', 'issued', 'sold', 'returned', 'adjustment', 'damaged', 'lost'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-xs text-text-secondary">Warehouse</label><Select value={form.warehouse_id || ''} onValueChange={(v) => setForm({ ...form, warehouse_id: v })}><SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select></div>
            {[['quantity', 'Quantity'], ['reason', 'Reason'], ['notes', 'Notes']].map(([k, label]) => (
              <div key={k}><label className="text-xs text-text-secondary">{label}</label><Input value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
            {form.movement_type === 'adjustment' && <div><label className="text-xs text-text-secondary">New quantity (for adjustment)</label><Input value={form.new_quantity || ''} onChange={(e) => setForm({ ...form, new_quantity: e.target.value })} /></div>}
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowMoveModal(false)}>Cancel</Button><Button disabled={saving} onClick={submitMovement} className="bg-accent-primary text-white">{saving ? 'Saving...' : 'Post movement'}</Button></div>
          </div>
        </div>
      )}

      {showGrnModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGrnModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Goods receipt — PO → received → stock</h3>
            <div><label className="text-xs text-text-secondary">Supplier*</label><Input value={form.supplier || ''} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
            <div><label className="text-xs text-text-secondary">Purchase order ref</label><Select value={form.purchase_order_ref || ''} onValueChange={(v) => setForm({ ...form, purchase_order_ref: v })}><SelectTrigger><SelectValue placeholder="None / select PO" /></SelectTrigger><SelectContent>{pos.map((p) => <SelectItem key={String(p.id)} value={String(p.po_number)}>{String(p.po_number)} · {String(p.supplier)}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-xs text-text-secondary">Product</label><Select value={form.product_id || ''} onValueChange={(v) => setForm({ ...form, product_id: v })}><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent>{items.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-xs text-text-secondary">Warehouse</label><Select value={form.warehouse_id || ''} onValueChange={(v) => setForm({ ...form, warehouse_id: v })}><SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-text-secondary">Received qty</label><Input value={form.received_quantity || ''} onChange={(e) => setForm({ ...form, received_quantity: e.target.value })} /></div>
              <div><label className="text-xs text-text-secondary">Damaged qty</label><Input value={form.damaged_quantity || ''} onChange={(e) => setForm({ ...form, damaged_quantity: e.target.value })} /></div>
            </div>
            <div><label className="text-xs text-text-secondary">Notes / delivery doc ref</label><Input value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowGrnModal(false)}>Cancel</Button><Button disabled={saving} onClick={submitGrn} className="bg-accent-primary text-white">{saving ? 'Posting...' : 'Receive & update stock'}</Button></div>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTransferModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Transfer stock A → B</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-text-secondary">Source</label><Select value={form.source_warehouse_id || ''} onValueChange={(v) => setForm({ ...form, source_warehouse_id: v })}><SelectTrigger><SelectValue placeholder="From" /></SelectTrigger><SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-xs text-text-secondary">Destination</label><Select value={form.destination_warehouse_id || ''} onValueChange={(v) => setForm({ ...form, destination_warehouse_id: v })}><SelectTrigger><SelectValue placeholder="To" /></SelectTrigger><SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><label className="text-xs text-text-secondary">Product</label><Select value={form.product_id || ''} onValueChange={(v) => setForm({ ...form, product_id: v })}><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent>{items.map((i) => <SelectItem key={i.id} value={i.id}>{i.name} ({i.quantity_on_hand})</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-xs text-text-secondary">Quantity</label><Input value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowTransferModal(false)}>Cancel</Button><Button disabled={saving} onClick={submitTransfer} className="bg-accent-primary text-white">{saving ? 'Saving...' : 'Request transfer'}</Button></div>
          </div>
        </div>
      )}
    </div>
  )
}
