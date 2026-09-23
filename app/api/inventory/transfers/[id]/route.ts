import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, audit } from '@/lib/operations/server'
import { generateReference } from '@/lib/operations/types'

const db = new DBClient()

async function getTransfer(id: string) {
  const { data, error } = await db.from('purchase_orders').select('*').eq('id', id).single()
  if (error || !data) return null
  return data as unknown as Record<string, unknown>
}

async function adjustStock(productId: string, warehouseId: string, delta: number): Promise<{ ok: boolean; error?: string; newQty?: number }> {
  const { data: ws } = await db.from('warehouse_stock').select('*').eq('product_id', productId).eq('warehouse_id', warehouseId).single()
  const row = (ws as unknown as Record<string, unknown>) || null
  const prev = Number((row?.quantity as number) || 0)
  const next = prev + delta
  if (next < 0) return { ok: false, error: `Insufficient stock (${prev})` }
  if (row) {
    await db.from('warehouse_stock').update({ quantity: next, updated_at: new Date().toISOString() }).eq('id', String(row.id))
  } else {
    await db.from('warehouse_stock').insert({ product_id: productId, warehouse_id: warehouseId, quantity: next, updated_at: new Date().toISOString() })
  }
  // keep product total in sync
  const { data: prod } = await db.from('products').select('*').eq('id', productId).single()
  const p = (prod as unknown as Record<string, unknown>) || null
  if (p) {
    const { data: all } = await db.from('warehouse_stock').select('*').eq('product_id', productId).limit(100)
    const total = (((all as unknown as Array<Record<string, unknown>>) || [])).reduce((s, r) => s + Number(r.quantity || 0), 0)
    await db.from('products').update({ quantity_on_hand: total, updated_at: new Date().toISOString() }).eq('id', productId)
  }
  return { ok: true, newQty: next }
}

// PUT /api/inventory/transfers/[id] { action: approve|dispatch|receive|cancel, ... }
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const t = await getTransfer(params.id)
    if (!t) return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })
    const meta = (t.items as unknown as Record<string, unknown>) || {}
    if (String((meta.kind as string) || '') !== 'stock_transfer') return NextResponse.json({ error: 'Not a stock transfer' }, { status: 400 })
    const body = (await request.json()) as Record<string, unknown>
    const action = String(body.action || '')
    const current = String(t.status || '')
    const lines = ((meta.lines as unknown[]) || []) as Array<Record<string, unknown>>
    const sourceId = String(meta.source_warehouse_id || '')
    const destId = String(meta.destination_warehouse_id || '')

    const setStatus = async (s: string, extra: Record<string, unknown> = {}) => {
      const nextMeta = { ...(meta as object), ...(extra as object) }
      const { data, error } = await db.from('purchase_orders').update({ status: s, items: nextMeta, notes: body.notes ? String(body.notes) : String(t.notes || '') }).eq('id', params.id).select().single()
      if (error) throw new Error(error.message)
      return data
    }

    if (action === 'approve') {
      if (current !== 'transfer:requested' && current !== 'transfer:draft') return NextResponse.json({ error: `Cannot approve from ${current}` }, { status: 400 })
      const data = await setStatus('transfer:approved', { approved_by: auth.user.name || auth.user.email })
      await audit(auth.user.userId, 'inventory.transfer_approve', 'stock_transfer', params.id, { action }, request)
      return NextResponse.json({ transfer: data })
    }
    if (action === 'dispatch') {
      if (current !== 'transfer:approved') return NextResponse.json({ error: `Dispatch requires approved status (now ${current})` }, { status: 400 })
      // Decrement source NOW, hold in transit (destination NOT increased until receive)
      for (const ln of lines) {
        const r = await adjustStock(String(ln.product_id), sourceId, -Number(ln.quantity || 0))
        if (!r.ok) return NextResponse.json({ error: `Source stock failed: ${r.error}` }, { status: 400 })
        await db.from('inventory_movements').insert({
          reference_number: generateReference('MV'),
          movement_type: 'transferred',
          product_id: String(ln.product_id),
          warehouse_id: sourceId,
          quantity: -Number(ln.quantity || 0),
          previous_quantity: (r.newQty || 0) + Number(ln.quantity || 0),
          new_quantity: r.newQty || 0,
          source_destination: `Transfer ${String(t.po_number)} → in transit`,
          person_responsible: String(body.dispatched_by || auth.user.name || ''),
          reason: 'Stock transfer dispatch',
          related_document_type: 'stock_transfer',
          related_document_id: params.id,
          notes: '',
          created_by: auth.user.userId,
          created_at: new Date().toISOString(),
        })
      }
      const data = await setStatus('transfer:in_transit', { dispatched_by: String(body.dispatched_by || auth.user.name || '') })
      await audit(auth.user.userId, 'inventory.transfer_dispatch', 'stock_transfer', params.id, { action }, request)
      return NextResponse.json({ transfer: data })
    }
    if (action === 'receive') {
      if (current !== 'transfer:in_transit') return NextResponse.json({ error: `Receive requires in_transit status (now ${current})` }, { status: 400 })
      for (const ln of lines) {
        const r = await adjustStock(String(ln.product_id), destId, Number(ln.quantity || 0))
        if (!r.ok) return NextResponse.json({ error: `Destination stock failed: ${r.error}` }, { status: 400 })
        await db.from('inventory_movements').insert({
          reference_number: generateReference('MV'),
          movement_type: 'transferred',
          product_id: String(ln.product_id),
          warehouse_id: destId,
          quantity: Number(ln.quantity || 0),
          previous_quantity: (r.newQty || 0) - Number(ln.quantity || 0),
          new_quantity: r.newQty || 0,
          source_destination: `Transfer ${String(t.po_number)} received`,
          person_responsible: String(body.received_by || auth.user.name || ''),
          reason: 'Stock transfer receipt',
          related_document_type: 'stock_transfer',
          related_document_id: params.id,
          notes: '',
          created_by: auth.user.userId,
          created_at: new Date().toISOString(),
        })
      }
      const data = await setStatus('transfer:received', { received_by: String(body.received_by || auth.user.name || '') })
      await audit(auth.user.userId, 'inventory.transfer_receive', 'stock_transfer', params.id, { action }, request)
      return NextResponse.json({ transfer: data })
    }
    if (action === 'cancel') {
      if (current === 'transfer:received') return NextResponse.json({ error: 'Received transfers cannot be cancelled' }, { status: 400 })
      const data = await setStatus('transfer:cancelled')
      await audit(auth.user.userId, 'inventory.transfer_cancel', 'stock_transfer', params.id, { action }, request)
      return NextResponse.json({ transfer: data })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
