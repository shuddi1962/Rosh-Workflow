import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { paystackSecret, paystackSignatureValid, paystackVerify, activateSubscription } from '@/lib/drive/billing'
import { type Row } from '@/lib/drive/server'

const db = new DBClient()

// POST /api/webhooks/paystack — charge.success activates storage server-side.
export async function POST(request: Request) {
  try {
    const raw = await request.text()
    const secret = await paystackSecret()
    if (!secret) return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })
    const sig = request.headers.get('x-paystack-signature') || ''
    if (!paystackSignatureValid(raw, sig, secret)) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    const event = JSON.parse(raw) as { event?: string; data?: { reference?: string } }
    if (event.event !== 'charge.success' || !event.data?.reference) return NextResponse.json({ ok: true, ignored: true })
    const reference = String(event.data.reference)
    const { data: txRow } = await db.from('storage_transactions').select('*').eq('provider_reference', reference).single()
    const tx = txRow as unknown as Row | null
    if (!tx || tx.status === 'verified') return NextResponse.json({ ok: true, already: true })
    const v = await paystackVerify(reference)
    if (!v.paid) {
      await db.from('storage_transactions').update({ status: 'failed' }).eq('id', String(tx.id))
      return NextResponse.json({ ok: true, paid: false })
    }
    const { data: planRow } = await db.from('storage_plans').select('*').eq('name', String(tx.plan_name)).single()
    if (!planRow) return NextResponse.json({ error: 'Plan gone' }, { status: 410 })
    await activateSubscription({
      business_id: String(tx.business_id), plan: planRow as unknown as Row,
      billing_cycle: String(tx.billing_cycle) === 'annual' ? 'annual' : 'monthly',
      provider: 'paystack', provider_reference: reference, amount_ngn: Number(tx.amount_ngn),
      actor_user_id: 'webhook:paystack', transaction_id: String(tx.id),
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
