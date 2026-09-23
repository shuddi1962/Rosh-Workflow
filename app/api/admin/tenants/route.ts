import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireRole, audit } from '@/lib/operations/server'

const db = new DBClient()

// Admin: list + create businesses (tenants), each with a tailored plan.
export async function GET(request: Request) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  const { data: businesses, error } = await db.from('businesses').select('*').order('created_at', { ascending: false }).limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const { data: subs } = await db.from('subscriptions').select('*').limit(500)
  const { data: members } = await db.from('business_members').select('*').limit(2000)
  const rows = ((businesses as unknown as Array<Record<string, unknown>>) || []).map((b) => ({
    ...b,
    subscription: (((subs as unknown as Array<Record<string, unknown>>) || []).find((s) => String(s.business_id) === String(b.id))) || null,
    member_count: (((members as unknown as Array<Record<string, unknown>>) || []).filter((m) => String(m.business_id) === String(b.id))).length,
  }))
  return NextResponse.json({ businesses: rows })
}

export async function POST(request: Request) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const name = String(body.name || '').trim()
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    const slug = String(body.slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || `biz-${Date.now()}`
    const plan = String(body.plan || 'Starter')
    const { data, error } = await db.from('businesses').insert({
      name,
      slug,
      industry: String(body.industry || ''),
      email: String(body.email || ''),
      phone: String(body.phone || ''),
      plan,
      status: String(body.status || 'active'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const created = data as unknown as Record<string, unknown>
    await db.from('subscriptions').insert({
      business_id: String(created.id),
      plan_name: plan,
      status: 'trial',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    await audit(auth.user.userId, 'tenant.create', 'business', String(created.id), { name, plan }, request)
    return NextResponse.json({ business: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
