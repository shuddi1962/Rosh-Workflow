import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, notifyUser } from '@/lib/operations/server'
import { emitEvent, linkRecords } from '@/lib/operations/events'
import { generateReference } from '@/lib/operations/types'

const db = new DBClient()

export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { data, error } = await db.from('goods_receipts').select('*').order('created_at', { ascending: false }).limit(300)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const rows = ((data as unknown as Array<Record<string, unknown>>) || [])
    // attach items
    const { data: itemsRaw } = await db.from('goods_receipt_items').select('*').limit(2000)
    const items = ((itemsRaw as unknown as Array<Record<string, unknown>>) || [])
    const byGrn = new Map<string, Array<Record<string, unknown>>>()
    for (const it of items) {
      const k = String(it.goods_receipt_id)
      if (!byGrn.has(k)) byGrn.set(k, [])
      byGrn.get(k)?.push(it)
    }
    return NextResponse.json({ goods_receipts: rows.map((r) => ({ ...r, items: byGrn.get(String(r.id)) || [] })) })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/inventory/goods-receipts — PO -> received -> inspection -> stock updated (accepted qty only)
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const supplier = String(body.supplier || '').trim()
    const items = (body.items as Array<{ product_id: string; ordered_quantity?: number; received_quantity: number; damaged_quantity?: number }>) || []
    if (!supplier) return NextResponse.json({ error: 'supplier is required' }, { status: 400 })
    if (!items.length) return NextResponse.json({ error: 'at least one item required' }, { status: 400 })
    const warehouseId = body.warehouse_id ? String(body.warehouse_id) : null
    const grnNumber = generateReference('GRN')

    const { data: grnRaw, error } = await db.from('goods_receipts').insert({
      grn_number: grnNumber,
      purchase_order_id: body.purchase_order_id ? String(body.purchase_order_id) : null,
      purchase_order_ref: String(body.purchase_order_ref || ''),
      supplier,
      delivery_date: body.delivery_date ? String(body.delivery_date) : null,
      received_date: body.received_date ? String(body.received_date) : new Date().toISOString(),
      warehouse_id: warehouseId,
      received_by: String(body.received_by || auth.user.name || auth.user.email),
      verification_status: String(body.verification_status || 'verified'),
      notes: String(body.notes || ''),
      attachments: Array.isArray(body.attachments) ? body.attachments : body.attachment_url ? [{ name: 'delivery-note', url: String(body.attachment_url) }] : [],
      stock_posted: false,
      created_by: auth.user.userId,
      created_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const grn = grnRaw as unknown as Record<string, unknown>
    const grnId = String(grn.id)

    // Post stock per accepted quantity
    for (const it of items) {
      const received = Number(it.received_quantity || 0)
      const damaged = Number(it.damaged_quantity || 0)
      const accepted = Math.max(received - damaged, 0)
      await db.from('goods_receipt_items').insert({
        goods_receipt_id: grnId,
        product_id: String(it.product_id),
        ordered_quantity: Number(it.ordered_quantity || received),
        received_quantity: received,
        damaged_quantity: damaged,
        accepted_quantity: accepted,
        notes: '',
      })
      if (accepted > 0) {
        // warehouse balance
        let prevWh = 0
        if (warehouseId) {
          const { data: ws } = await db.from('warehouse_stock').select('*').eq('product_id', String(it.product_id)).eq('warehouse_id', warehouseId).single()
          const row = (ws as unknown as Record<string, unknown>) || null
          prevWh = Number((row?.quantity as number) || 0)
          const next = prevWh + accepted
          if (row) await db.from('warehouse_stock').update({ quantity: next, updated_at: new Date().toISOString() }).eq('id', String(row.id))
          else await db.from('warehouse_stock').insert({ product_id: String(it.product_id), warehouse_id: warehouseId, quantity: next, updated_at: new Date().toISOString() })
        }
        const { data: prod } = await db.from('products').select('*').eq('id', String(it.product_id)).single()
        const p = (prod as unknown as Record<string, unknown>) || null
        const prevTotal = Number((p?.quantity_on_hand as number) || 0)
        const newTotal = prevTotal + accepted
        if (p) await db.from('products').update({ quantity_on_hand: newTotal, stock_status: newTotal <= 0 ? 'out_of_stock' : 'in_stock', updated_at: new Date().toISOString() }).eq('id', String(it.product_id))
        await db.from('inventory_movements').insert({
          reference_number: generateReference('MV'),
          movement_type: 'received',
          product_id: String(it.product_id),
          warehouse_id: warehouseId,
          quantity: accepted,
          previous_quantity: warehouseId ? prevWh : prevTotal,
          new_quantity: warehouseId ? prevWh + accepted : newTotal,
          source_destination: supplier,
          person_responsible: String(body.received_by || auth.user.name || ''),
          reason: `Goods receipt ${grnNumber}`,
          related_document_type: 'goods_receipt',
          related_document_id: grnId,
          notes: damaged > 0 ? `${damaged} damaged on arrival` : '',
          created_by: auth.user.userId,
          created_at: new Date().toISOString(),
        })
      }
    }
    await db.from('goods_receipts').update({ stock_posted: true }).eq('id', grnId)
    // Connected BOS: one event + graph edges (PO -> GRN -> movements), no duplicate entry.
    await emitEvent(auth.user, {
      event_type: 'goods.received',
      entity_type: 'goods_receipt',
      entity_id: grnId,
      entity_ref: grnNumber,
      title: `Goods received — ${grnNumber}`,
      summary: `${supplier} · ${items.length} line(s) posted to stock`,
      metadata: { supplier, purchase_order_ref: String(body.purchase_order_ref || '') },
      related_entity_type: 'supplier',
      related_entity_ref: supplier,
    }, request)
    if (body.purchase_order_id) {
      await linkRecords({ source_type: 'purchase_order', source_id: String(body.purchase_order_id), target_type: 'goods_receipt', target_id: grnId, link_type: 'fulfilled_by', created_by: auth.user.userId })
    } else if (body.purchase_order_ref) {
      await linkRecords({ source_type: 'purchase_order_ref', source_id: String(body.purchase_order_ref), target_type: 'goods_receipt', target_id: grnId, link_type: 'fulfilled_by', created_by: auth.user.userId })
    }
    await linkRecords({ source_type: 'supplier', source_id: supplier, target_type: 'goods_receipt', target_id: grnId, link_type: 'delivered', created_by: auth.user.userId })
    await notifyUser({ recipient_user_id: auth.user.userId, kind: 'grn_posted', title: 'Goods received', message: `${grnNumber} from ${supplier} posted to stock`, entity_type: 'goods_receipt', entity_id: grnId })
    return NextResponse.json({ goods_receipt: { ...grn, stock_posted: true }, grn_number: grnNumber }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
