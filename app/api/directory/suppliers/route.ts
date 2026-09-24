import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { emitEvent, linkRecords } from '@/lib/operations/events'

const db = new DBClient()

// GET /api/directory/suppliers?search=
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('search') || '').toLowerCase()
    const { data, error } = await db.from('suppliers').select('*').order('name', { ascending: true }).limit(500)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    let rows = ((data as unknown as Array<Record<string, unknown>>) || [])
    if (q) {
      rows = rows.filter((r) =>
        `${String(r.name || '')} ${String(r.phone || '')} ${String(r.email || '')}`.toLowerCase().includes(q)
      )
    }
    return NextResponse.json({ suppliers: rows, count: rows.length })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/directory/suppliers — { name*, phone, email, address, division, notes }
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const name = String(body.name || '').trim()
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    const { data, error } = await db.from('suppliers').insert({
      name,
      contact_person: String(body.contact_person || ''),
      phone: String(body.phone || ''),
      email: String(body.email || ''),
      address: String(body.address || ''),
      division: String(body.division || 'both'),
      notes: String(body.notes || ''),
      is_active: true,
      created_by: auth.user.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const row = data as unknown as Record<string, unknown>
    await emitEvent(auth.user, {
      event_type: 'supplier.created',
      entity_type: 'supplier',
      entity_id: String(row.id),
      entity_ref: name,
      title: `Supplier added — ${name}`,
      summary: String(body.phone || body.email || ''),
    }, request)
    await linkRecords({ source_type: 'supplier', source_id: String(row.id), target_type: 'supplier', target_id: name, link_type: 'alias', created_by: auth.user.userId })
    return NextResponse.json({ supplier: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
