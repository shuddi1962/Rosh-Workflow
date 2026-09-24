import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { emitEvent } from '@/lib/operations/events'

const db = new DBClient()

// GET /api/directory/customers?search=
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('search') || '').toLowerCase()
    const { data, error } = await db.from('customers').select('*').order('name', { ascending: true }).limit(500)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    let rows = ((data as unknown as Array<Record<string, unknown>>) || [])
    if (q) {
      rows = rows.filter((r) =>
        `${String(r.name || '')} ${String(r.company || '')} ${String(r.phone || '')}`.toLowerCase().includes(q)
      )
    }
    return NextResponse.json({ customers: rows, count: rows.length })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/directory/customers — { name*, company, phone, email, address }
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const name = String(body.name || '').trim()
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    const { data, error } = await db.from('customers').insert({
      name,
      company: String(body.company || ''),
      phone: String(body.phone || ''),
      email: String(body.email || ''),
      address: String(body.address || ''),
      division_interest: String(body.division_interest || 'both'),
      notes: String(body.notes || ''),
      is_active: true,
      created_by: auth.user.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const row = data as unknown as Record<string, unknown>
    await emitEvent(auth.user, {
      event_type: 'customer.created',
      entity_type: 'customer',
      entity_id: String(row.id),
      entity_ref: name,
      title: `Customer added — ${name}`,
      summary: String(body.company || body.phone || ''),
    }, request)
    return NextResponse.json({ customer: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
