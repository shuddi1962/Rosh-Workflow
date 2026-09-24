import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireRole } from '@/lib/operations/server'
import { activateSubscription } from '@/lib/drive/billing'
import { type Row } from '@/lib/drive/server'

const db = new DBClient()

// GET /api/admin/storage/subscriptions?business_id= — list (admin only)
export async function GET(request: Request) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  const biz = new URL(request.url).searchParams.get('business_id')
  let q = db.from('storage_subscriptions').select('*').limit(500)
  if (biz) q = q.eq('business_id', biz)
  const { data } = await q
  return NextResponse.json({ subscriptions: ((data as unknown as Row[]) || []) })
}

// POST /api/admin/storage/subscriptions { business_id, plan_id, billing_cycle }
// — manual admin activation (e.g. bank transfer, Enterprise custom deals).
export async function POST(request: Request) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Row
    const businessId = String(body.business_id || '')
    if (!businessId) return NextResponse.json({ error: 'business_id is required' }, { status: 400 })
    const { data: planRow } = await db.from('storage_plans').select('*').eq('id', String(body.plan_id || '')).single()
    if (!planRow) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    const { subscription } = await activateSubscription({
      business_id: businessId, plan: planRow as unknown as Row,
      billing_cycle: String(body.billing_cycle) === 'annual' ? 'annual' : 'monthly',
      provider: 'manual', provider_reference: `ADMIN-${Date.now().toString(36).toUpperCase()}`,
      amount_ngn: 0, actor_user_id: auth.user.userId,
    })
    return NextResponse.json({ subscription }, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: msg.startsWith('Downgrade blocked') ? 409 : 500 })
  }
}

// PUT /api/admin/storage/subscriptions { subscription_id, action: cancel }
// — cancel (downgrades to Free only when usage fits, else 409).
export async function PUT(request: Request) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Row
    if (String(body.action) !== 'cancel' || !body.subscription_id) {
      return NextResponse.json({ error: 'action=cancel + subscription_id required' }, { status: 400 })
    }
    const { data: sub } = await db.from('storage_subscriptions').select('*').eq('id', String(body.subscription_id)).single()
    if (!sub) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    const s = sub as unknown as Row
    await db.from('storage_subscriptions').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', String(s.id))
    try {
      const { data: free } = await db.from('storage_plans').select('*').eq('name', 'Free').single()
      if (free) {
        await activateSubscription({
          business_id: String(s.business_id), plan: free as unknown as Row, billing_cycle: 'monthly',
          provider: 'manual', provider_reference: `ADMIN-CANCEL-${Date.now().toString(36).toUpperCase()}`,
          amount_ngn: 0, actor_user_id: auth.user.userId,
        })
      }
    } catch (e) {
      // Downgrade blocked by usage: keep cancelled state, report clearly.
      return NextResponse.json({ ok: true, warning: e instanceof Error ? e.message : 'Free fallback blocked by usage' })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
