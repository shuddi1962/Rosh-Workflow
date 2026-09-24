import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, type Row } from '@/lib/drive/server'
import { activeProvider, paystackInitialize, flutterwaveInitialize } from '@/lib/drive/billing'

const db = new DBClient()

// POST /api/storage/checkout { plan_id, billing_cycle } — start upgrade.
// Storage is NEVER increased here; activation happens only after verify/webhook.
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const body = (await request.json()) as Row
    const cycle = String(body.billing_cycle || 'monthly')
    if (!['monthly', 'annual'].includes(cycle)) return NextResponse.json({ error: 'billing_cycle must be monthly or annual' }, { status: 400 })
    const { data: planRow } = await db.from('storage_plans').select('*').eq('id', String(body.plan_id || '')).single()
    const plan = planRow as unknown as Row | null
    if (!plan || plan.is_active === false) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    const amount = Number(cycle === 'annual' ? plan.price_annual_ngn : plan.price_monthly_ngn) || 0
    if (amount <= 0) {
      return NextResponse.json({ error: `${String(plan.name)} has custom pricing — contact your administrator to activate it.` }, { status: 400 })
    }
    const provider = await activeProvider()
    const reference = `ST-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
    const { data: tx, error } = await db.from('storage_transactions').insert({
      business_id: businessId, plan_name: String(plan.name), billing_cycle: cycle,
      amount_ngn: amount, currency: String(plan.currency || 'NGN'),
      provider: provider === 'none' ? 'manual' : provider,
      provider_reference: reference, status: 'pending', created_at: new Date().toISOString(),
    }).select().single()
    if (error || !tx) return NextResponse.json({ error: error?.message || 'Checkout failed' }, { status: 500 })
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const callbackUrl = `${appUrl}/dashboard/drive?view=storage&verify=${reference}`
    if (provider === 'paystack') {
      try {
        const { authorization_url } = await paystackInitialize({ email: auth.user.email, amountKobo: Math.round(amount * 100), reference, callbackUrl })
        return NextResponse.json({ reference, authorization_url, provider })
      } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Payment init failed', reference }, { status: 502 })
      }
    }
    if (provider === 'flutterwave') {
      try {
        const { link } = await flutterwaveInitialize({ email: auth.user.email, name: auth.user.name, amountNgn: amount, txRef: reference, redirectUrl: callbackUrl })
        return NextResponse.json({ reference, authorization_url: link, provider })
      } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Payment init failed', reference }, { status: 502 })
      }
    }
    // No provider configured: pending transaction for admin activation.
    return NextResponse.json({
      reference, provider: 'manual', manual: true,
      message: 'Online payment is not configured. Your request is recorded as pending — an administrator will activate it.',
    }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
