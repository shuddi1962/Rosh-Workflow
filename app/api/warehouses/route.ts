import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, audit } from '@/lib/operations/server'

const db = new DBClient()

export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const { data, error } = await db.from('warehouses').select('*').order('name', { ascending: true }).limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ warehouses: (data as unknown[]) || [] })
}

export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const name = String(body.name || '').trim()
    const code = String(body.code || name).trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 24) || `WH-${Date.now()}`
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    const { data, error } = await db
      .from('warehouses')
      .insert({
        code,
        name,
        location_type: String(body.location_type || 'warehouse'),
        address: String(body.address || ''),
        manager_user_id: String(body.manager_user_id || ''),
        is_active: body.is_active !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await audit(auth.user.userId, 'warehouse.create', 'warehouse', (data as unknown as Record<string, unknown>).id as string, { name, code }, request)
    return NextResponse.json({ warehouse: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
