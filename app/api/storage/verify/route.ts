import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, getStorageContext, type Row } from '@/lib/drive/server'
import { paystackVerify, flutterwaveVerify, activateSubscription } from '@/lib/drive/billing'

const db = new DBClient()

// POST /api/storage/verify { reference, transaction_id? } — server-side verification.
// The ONLY path (besides provider webhooks + admin activation) that can
// increase storage. Frontend success screens never grant entitlement.
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const body = (await request.json()) as Row
    const reference = String(body.reference || '')
    if (!reference) return NextResponse.json({ error: 'reference is required' }, { status: 400 })
    const { data: txRow } = await db.from('storage_transactions').select('*').eq('provider_reference', reference).eq('business_id', businessId).single()
    const tx = txRow as unknown as Row | null
    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    if (tx.status === 'verified') {
      const ctx = await getStorageContext(businessId)
      return NextResponse.json({ ok: true, already: true, plan: ctx.plan, subscription: ctx.subscription })
    }
    if (tx.provider === 'manual' || !tx.provider) {
      return NextResponse.json({ error: 'Manual request is pending administrator activation.', status: String(tx.status) }, { status: 202 })
    }
    if (tx.provider === 'paystack') {
      const v = await paystackVerify(reference)
      if (!v.paid) {
        await db.from('storage_transactions').update({ status: 'failed' }).eq('id', String(tx.id))
        return NextResponse.json({ error: 'Payment not confirmed by Paystack.' }, { status: 402 })
      }
      if (Math.round(Number(v.amountKobo) / 100) < Number(tx.amount_ngn)) {
        return NextResponse.json({ error: 'Paid amount does not match the plan price.' }, { status: 402 })
      }
    } else if (tx.provider === 'flutterwave') {
      const txId = String(body.transaction_id || '')
      if (!txId) return NextResponse.json({ error: 'transaction_id is required for Flutterwave verification' }, { status: 400 })
      const v = await flutterwaveVerify(txId)
      if (!v.paid || v.txRef !== reference || v.amountNgn < Number(tx.amount_ngn)) {
        await db.from('storage_transactions').update({ status: 'failed' }).eq('id', String(tx.id))
        return NextResponse.json({ error: 'Payment not confirmed by Flutterwave.' }, { status: 402 })
      }
    } else {
      return NextResponse.json({ error: `Unknown provider ${String(tx.provider)}` }, { status: 400 })
    }
    const { data: planRow } = await db.from('storage_plans').select('*').eq('name', String(tx.plan_name)).single()
    if (!planRow) return NextResponse.json({ error: 'Plan no longer exists' }, { status: 410 })
    const { subscription } = await activateSubscription({
      business_id: businessId, plan: planRow as unknown as Row,
      billing_cycle: (String(tx.billing_cycle) === 'annual' ? 'annual' : 'monthly'),
      provider: String(tx.provider), provider_reference: reference,
      amount_ngn: Number(tx.amount_ngn), actor_user_id: auth.user.userId,
      transaction_id: String(tx.id),
    })
    return NextResponse.json({ ok: true, subscription })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    const code = msg.startsWith('Downgrade blocked') ? 409 : 500
    return NextResponse.json({ error: msg }, { status: code })
  }
}
