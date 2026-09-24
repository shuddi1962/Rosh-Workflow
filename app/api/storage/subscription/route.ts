import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, getStorageContext, formatBytes, type Row } from '@/lib/drive/server'

const db = new DBClient()

// GET /api/storage/subscription — current plan + usage + payment history
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const ctx = await getStorageContext(businessId)
    const { data: tx } = await db.from('storage_transactions').select('*').eq('business_id', businessId).limit(50)
    const history = (((tx as unknown as Row[]) || []).sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))))
    const quota = Number(ctx.plan.capacity_bytes || 0)
    return NextResponse.json({
      plan: ctx.plan,
      subscription: ctx.subscription,
      used_bytes: ctx.used_bytes,
      used_display: formatBytes(ctx.used_bytes),
      quota_display: formatBytes(quota),
      remaining_bytes: Math.max(0, quota - ctx.used_bytes),
      percent_used: quota ? Math.round((ctx.used_bytes / quota) * 100) : 0,
      history: history.map((t) => ({ date: t.created_at, plan: t.plan_name, cycle: t.billing_cycle, amount: t.amount_ngn, currency: t.currency, status: t.status, provider: t.provider, reference: t.provider_reference })),
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
