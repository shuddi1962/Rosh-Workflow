import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, notifyUser } from '@/lib/operations/server'
import { emitEvent, linkRecords } from '@/lib/operations/events'
import { generateReference, type MovementType } from '@/lib/operations/types'

const db = new DBClient()
const INCREASE = new Set(['received', 'returned', 'opening_balance'])
const DECREASE = new Set(['issued', 'sold', 'damaged', 'lost'])

export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id') || ''
    const warehouseId = searchParams.get('warehouse_id') || ''
    const type = searchParams.get('type') || ''
    const limit = Math.min(Number(searchParams.get('limit') || 300), 1000)
    const { data, error } = await db.from('inventory_movements').select('*').order('created_at', { ascending: false }).limit(limit)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    let rows = ((data as unknown as Array<Record<string, unknown>>) || [])
    if (productId) rows = rows.filter((r) => String(r.product_id) === productId)
    if (warehouseId) rows = rows.filter((r) => String(r.warehouse_id || '') === warehouseId)
    if (type) rows = rows.filter((r) => String(r.movement_type) === type)
    return NextResponse.json({ movements: rows, count: rows.length })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// POST — every stock change MUST go through here (auditable movement)
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const productId = String(body.product_id || '')
    const movementType = String(body.movement_type || '') as MovementType
    const qty = Number(body.quantity || 0)
    const warehouseId = body.warehouse_id ? String(body.warehouse_id) : null
    if (!productId) return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
    if (!movementType) return NextResponse.json({ error: 'movement_type is required' }, { status: 400 })
    if (!qty || qty <= 0) return NextResponse.json({ error: 'quantity must be > 0' }, { status: 400 })

    // Current product
    const { data: prodRaw, error: prodErr } = await db.from('products').select('*').eq('id', productId).single()
    if (prodErr || !prodRaw) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    const product = prodRaw as unknown as Record<string, unknown>

    // Current warehouse balance (if warehouse given)
    let prevWh = 0
    let stockRow: Record<string, unknown> | null = null
    if (warehouseId) {
      const { data: ws } = await db.from('warehouse_stock').select('*').eq('product_id', productId).eq('warehouse_id', warehouseId).single()
      stockRow = (ws as unknown as Record<string, unknown>) || null
      prevWh = Number((stockRow?.quantity as number) || 0)
    }
    const prevTotal = Number(product.quantity_on_hand || 0)

    let newWh = prevWh
    let newTotal = prevTotal
    if (INCREASE.has(movementType)) {
      newWh = prevWh + qty
      newTotal = prevTotal + qty
    } else if (DECREASE.has(movementType)) {
      newWh = prevWh - qty
      newTotal = prevTotal - qty
    } else if (movementType === 'adjustment') {
      // adjustment carries explicit new quantity via body.new_quantity (warehouse-scoped if warehouse given)
      const explicit = Number(body.new_quantity)
      if (Number.isNaN(explicit) || explicit < 0) return NextResponse.json({ error: 'adjustment requires new_quantity >= 0' }, { status: 400 })
      if (warehouseId) {
        newWh = explicit
        newTotal = prevTotal - prevWh + explicit
      } else {
        newTotal = explicit
      }
    } else if (movementType === 'transferred') {
      return NextResponse.json({ error: 'Use /api/inventory/transfers for transfers' }, { status: 400 })
    }

    if (newTotal < 0 || (warehouseId && newWh < 0)) {
      return NextResponse.json({ error: 'Insufficient stock: inventory cannot go negative' }, { status: 400 })
    }

    // Persist warehouse stock
    if (warehouseId) {
      if (stockRow) {
        await db.from('warehouse_stock').update({ quantity: newWh, updated_at: new Date().toISOString() }).eq('id', String(stockRow.id))
      } else {
        await db.from('warehouse_stock').insert({ product_id: productId, warehouse_id: warehouseId, quantity: newWh, updated_at: new Date().toISOString() })
      }
    }
    await db.from('products').update({
      quantity_on_hand: newTotal,
      stock_status: newTotal <= 0 ? 'out_of_stock' : newTotal <= Number(product.reorder_level || 0) ? 'low_stock' : 'in_stock',
      updated_at: new Date().toISOString(),
    }).eq('id', productId)

    const ref = String(body.reference_number || generateReference('MV'))
    const { data: mov, error: movErr } = await db
      .from('inventory_movements')
      .insert({
        reference_number: ref,
        movement_type: movementType,
        product_id: productId,
        warehouse_id: warehouseId,
        quantity: movementType === 'adjustment' && warehouseId ? newWh - prevWh : INCREASE.has(movementType) ? qty : movementType === 'adjustment' ? newTotal - prevTotal : -qty,
        previous_quantity: warehouseId ? prevWh : prevTotal,
        new_quantity: warehouseId ? newWh : newTotal,
        source_destination: String(body.source_destination || ''),
        person_responsible: String(body.person_responsible || auth.user.name || auth.user.email),
        reason: String(body.reason || ''),
        related_document_type: String(body.related_document_type || ''),
        related_document_id: String(body.related_document_id || ''),
        notes: String(body.notes || ''),
        attachment_url: body.attachment_url ? String(body.attachment_url) : null,
        created_by: auth.user.userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (movErr) return NextResponse.json({ error: movErr.message }, { status: 500 })

    const movId = String((mov as unknown as Record<string, unknown>).id)
    await emitEvent(auth.user, {
      event_type: `stock.${movementType}`,
      entity_type: 'inventory_movement',
      entity_id: movId,
      entity_ref: ref,
      title: `Stock ${movementType} — ${String(product.name)}`,
      summary: `Qty ${qty} · ${prevTotal} → ${newTotal}`,
      metadata: { productId, movementType, qty, prevTotal, newTotal },
      related_entity_type: String(body.related_document_type || ''),
      related_entity_id: String(body.related_document_id || ''),
    }, request)
    if (body.related_document_type && body.related_document_id) {
      await linkRecords({ source_type: String(body.related_document_type), source_id: String(body.related_document_id), target_type: 'inventory_movement', target_id: movId, link_type: 'posted', created_by: auth.user.userId })
    }
    // Low-stock notification (no spam: only when crossing threshold)
    if (newTotal <= Number(product.reorder_level || 0) && Number(product.reorder_level || 0) > 0) {
      await notifyUser({ recipient_user_id: auth.user.userId, kind: 'low_stock', title: 'Low stock alert', message: `${String(product.name)} is at ${newTotal} (reorder ${String(product.reorder_level)})`, entity_type: 'product', entity_id: productId })
    }
    return NextResponse.json({ movement: mov, new_quantity: warehouseId ? newWh : newTotal }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
