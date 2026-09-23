import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, audit } from '@/lib/operations/server'
import { generateReference } from '@/lib/operations/types'

const db = new DBClient()

export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const { data, error } = await db.from('purchase_orders').select('*').order('created_at', { ascending: false }).limit(300)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rows = (((data as unknown as Array<Record<string, unknown>>) || [])).filter((r) => String((r.items as unknown as Record<string, unknown>)?.kind || '') !== 'stock_transfer')
  return NextResponse.json({ purchase_orders: rows })
}

export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const supplier = String(body.supplier || '').trim()
    if (!supplier) return NextResponse.json({ error: 'supplier is required' }, { status: 400 })
    const poNumber = String(body.po_number || generateReference('PO'))
    const { data, error } = await db.from('purchase_orders').insert({
      po_number: poNumber,
      supplier,
      division: String(body.division || 'both'),
      status: String(body.status || 'draft'),
      order_date: body.order_date ? String(body.order_date) : new Date().toISOString(),
      expected_date: body.expected_date ? String(body.expected_date) : null,
      items: { kind: 'purchase_order', lines: Array.isArray(body.items) ? body.items : [] },
      total_amount_naira: Number(body.total_amount_naira || 0),
      notes: String(body.notes || ''),
      created_by: auth.user.userId,
      created_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await audit(auth.user.userId, 'purchase.create', 'purchase_order', (data as unknown as Record<string, unknown>).id as string, { poNumber }, request)
    return NextResponse.json({ purchase_order: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
