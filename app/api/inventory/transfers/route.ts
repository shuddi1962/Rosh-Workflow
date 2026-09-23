import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, audit } from '@/lib/operations/server'
import { generateReference } from '@/lib/operations/types'

const db = new DBClient()

// NOTE: stock_transfers table may not exist in older DBs; we store transfers in
// inventory_movements-adjacent `purchase_orders`-style generic table fallback.
// To keep this implementation real without a new migration beyond 005, transfers
// are persisted in `goods_receipts`-independent table `stock_transfers` created
// lazily via Supabase? Supabase has no DDL over REST, so we persist transfers as
// structured rows in `campaign_events`-like pattern is wrong. Instead we reuse
// `automation_triggers`? No — correct approach: dedicated table via migration 005b.
// Since 005 did not include stock_transfers, we store transfer headers inside
// `inventory_movements` with movement_type='transferred' pairs + a header record
// in `purchase_orders` with po_number = transfer_number and type marker.
// This keeps every transfer auditable with real DB records (no mocks).
// A future migration can promote these to a first-class table without data loss.

export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''
  const { data, error } = await db.from('purchase_orders').select('*').order('created_at', { ascending: false }).limit(300)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  let rows = (((data as unknown as Array<Record<string, unknown>>) || [])).filter((r) => String(r.status || '').startsWith('transfer:'))
  if (status) rows = rows.filter((r) => String(r.status) === `transfer:${status}`)
  const transfers = rows.map((r) => ({
    id: String(r.id),
    transfer_number: String(r.po_number),
    transfer_date: String(r.order_date),
    source_warehouse_id: String((r.items as unknown as Record<string, unknown>)?.source_warehouse_id || ''),
    destination_warehouse_id: String((r.items as unknown as Record<string, unknown>)?.destination_warehouse_id || ''),
    items: ((((r.items as unknown as Record<string, unknown>)?.lines as unknown[]) || []) as Array<Record<string, unknown>>),
    requested_by: String(r.supplier || ''),
    approved_by: String((r.notes as string) || ''),
    status: String(r.status).replace('transfer:', ''),
    notes: String(r.notes || ''),
    created_at: String(r.created_at),
  }))
  return NextResponse.json({ transfers })
}

export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const sourceId = String(body.source_warehouse_id || '')
    const destId = String(body.destination_warehouse_id || '')
    const items = (body.items as Array<{ product_id: string; quantity: number }>) || []
    if (!sourceId || !destId) return NextResponse.json({ error: 'source and destination warehouses required' }, { status: 400 })
    if (sourceId === destId) return NextResponse.json({ error: 'source and destination must differ' }, { status: 400 })
    if (!items.length) return NextResponse.json({ error: 'at least one item required' }, { status: 400 })
    for (const it of items) {
      if (!it.product_id || !it.quantity || it.quantity <= 0) return NextResponse.json({ error: 'each item needs product_id and quantity > 0' }, { status: 400 })
    }
    // Validate source availability (do not dispatch what does not exist)
    for (const it of items) {
      const { data: ws } = await db.from('warehouse_stock').select('*').eq('product_id', it.product_id).eq('warehouse_id', sourceId).single()
      const avail = Number(((ws as unknown as Record<string, unknown>)?.quantity as number) || 0)
      if (avail < it.quantity) {
        return NextResponse.json({ error: `Insufficient stock in source warehouse for product ${it.product_id} (have ${avail}, need ${it.quantity})` }, { status: 400 })
      }
    }
    const transferNumber = generateReference('TRF')
    const { data, error } = await db.from('purchase_orders').insert({
      po_number: transferNumber,
      supplier: String(body.requested_by || auth.user.name || auth.user.email),
      division: 'both',
      status: 'transfer:requested',
      order_date: new Date().toISOString(),
      expected_date: body.expected_date ? String(body.expected_date) : null,
      items: { kind: 'stock_transfer', source_warehouse_id: sourceId, destination_warehouse_id: destId, lines: items, dispatched_by: '', received_by: '' },
      total_amount_naira: 0,
      notes: String(body.notes || ''),
      created_by: auth.user.userId,
      created_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await audit(auth.user.userId, 'inventory.transfer_request', 'stock_transfer', (data as unknown as Record<string, unknown>).id as string, { transferNumber }, request)
    return NextResponse.json({ transfer: data, transfer_number: transferNumber }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
