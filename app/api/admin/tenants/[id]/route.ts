import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireRole, audit } from '@/lib/operations/server'

const db = new DBClient()

// Admin: update a business (plan tailored to its needs, status) — PUT /api/admin/tenants/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const k of ['name', 'industry', 'email', 'phone', 'plan', 'status']) {
      if (body[k] !== undefined) patch[k] = body[k]
    }
    const { data, error } = await db.from('businesses').update(patch).eq('id', params.id).select().single()
    if (error) throw new Error(error.message)
    if (body.plan !== undefined) {
      const { data: sub } = await db.from('subscriptions').select('*').eq('business_id', params.id).single()
      if (sub) {
        await db.from('subscriptions').update({ plan_name: String(body.plan), updated_at: new Date().toISOString() }).eq('business_id', params.id)
      } else {
        await db.from('subscriptions').insert({ business_id: params.id, plan_name: String(body.plan), status: 'active', started_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      }
    }
    await audit(auth.user.userId, 'tenant.update', 'business', params.id, { fields: Object.keys(patch) }, request)
    return NextResponse.json({ business: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
