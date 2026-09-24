import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { flutterwaveSecret, flutterwaveVerify, activateSubscription } from '@/lib/drive/billing'
import { type Row } from '@/lib/drive/server'

const db = new DBClient()

// POST /api/webhooks/flutterwave — verified charge activates storage server-side.
export async function POST(request: Request) {
  try {
    const secret = await flutterwaveSecret()
    if (!secret) return NextResponse.json({ error: 'Flutterwave not configured' }, { status: 500 })
    const verifHash = request.headers.get('verif-hash') || ''
    if (!verifHash || verifHash !== secret) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    const body = (await request.json()) as { event?: string; data?: { tx_ref?: string; id?: number | string; status?: string } }
    if (body.event !== 'charge.completed' || !body.data?.tx_ref) return NextResponse.json({ ok: true, ignored: true })
    const reference = String(body.data.tx_ref)
    const { data: txRow } = await db.from('storage_transactions').select('*').eq('provider_reference', reference).single()
    const tx = txRow as unknown as Row | null
    if (!tx || tx.status === 'verified') return NextResponse.json({ ok: true, already: true })
    const v = await flutterwaveVerify(String(body.data.id || ''))
    if (!v.paid || v.txRef !== reference) {
      await db.from('storage_transactions').update({ status: 'failed' }).eq('id', String(tx.id))
      return NextResponse.json({ ok: true, paid: false })
    }
    const { data: planRow } = await db.from('storage_plans').select('*').eq('name', String(tx.plan_name)).single()
    if (!planRow) return NextResponse.json({ error: 'Plan gone' }, { status: 410 })
    await activateSubscription({
      business_id: String(tx.business_id), plan: planRow as unknown as Row,
      billing_cycle: String(tx.billing_cycle) === 'annual' ? 'annual' : 'monthly',
      provider: 'flutterwave', provider_reference: reference, amount_ngn: Number(tx.amount_ngn),
      actor_user_id: 'webhook:flutterwave', transaction_id: String(tx.id),
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
