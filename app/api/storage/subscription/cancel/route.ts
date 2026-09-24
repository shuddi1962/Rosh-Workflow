import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, type Row } from '@/lib/drive/server'
import { activateSubscription } from '@/lib/drive/billing'

const db = new DBClient()

// POST /api/storage/subscription/cancel — user cancels; falls back to Free
// only when usage fits (downgrade protection), otherwise stays cancelled.
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const { data: actives } = await db.from('storage_subscriptions').select('*').eq('business_id', businessId).eq('status', 'active').limit(10)
    for (const s of ((actives as unknown as Row[]) || [])) {
      await db.from('storage_subscriptions').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', String(s.id))
    }
    try {
      const { data: free } = await db.from('storage_plans').select('*').eq('name', 'Free').single()
      if (free) {
        await activateSubscription({
          business_id: businessId, plan: free as unknown as Row, billing_cycle: 'monthly',
          provider: 'manual', provider_reference: `USER-CANCEL-${Date.now().toString(36).toUpperCase()}`,
          amount_ngn: 0, actor_user_id: auth.user.userId,
        })
        return NextResponse.json({ ok: true, fallback: 'Free' })
      }
    } catch (e) {
      return NextResponse.json({ ok: true, warning: e instanceof Error ? e.message : 'Free fallback blocked by usage' })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
