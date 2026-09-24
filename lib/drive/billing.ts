import crypto from 'crypto'
import { DBClient } from '@/lib/insforge/server'
import { decrypt } from '@/lib/encryption'
import { audit, notifyUser } from '@/lib/operations/server'
import { type Row } from '@/lib/drive/server'

const db = new DBClient()

export type PayProvider = 'none' | 'paystack' | 'flutterwave'

export async function activeProvider(): Promise<PayProvider> {
  const { data } = await db.from('feature_toggles').select('*').eq('feature_key', 'drive_payment_provider').single()
  const v = ((data as unknown as Row | null)?.value as Record<string, unknown>) || {}
  const p = String(v.provider || 'none')
  return (['paystack', 'flutterwave'].includes(p) ? p : 'none') as PayProvider
}

async function vaultSecret(service: string): Promise<string | null> {
  const { data } = await db.from('api_keys').select('*').eq('service', service).eq('is_active', true).limit(10)
  const rows = ((data as unknown as Row[]) || [])
  const pick = rows.find((r) => /secret/i.test(String(r.key_name || ''))) || rows[0]
  if (!pick) return null
  try {
    return decrypt(String(pick.encrypted_value))
  } catch {
    return null
  }
}

export async function paystackSecret(): Promise<string | null> {
  return vaultSecret('paystack')
}

export async function flutterwaveSecret(): Promise<string | null> {
  return vaultSecret('flutterwave')
}

// ---- provider REST calls (server → provider, never browser) --------------

export async function paystackInitialize(input: { email: string; amountKobo: number; reference: string; callbackUrl: string }): Promise<{ authorization_url: string }> {
  const secret = await paystackSecret()
  if (!secret) throw new Error('Paystack is not configured in Admin > API Keys')
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: input.email, amount: input.amountKobo, reference: input.reference, callback_url: input.callbackUrl }),
  })
  const data = (await res.json()) as { status?: boolean; message?: string; data?: { authorization_url?: string } }
  if (!res.ok || !data.status || !data.data?.authorization_url) throw new Error(data.message || 'Paystack initialize failed')
  return { authorization_url: data.data.authorization_url }
}

export async function paystackVerify(reference: string): Promise<{ paid: boolean; amountKobo: number; paidAt?: string }> {
  const secret = await paystackSecret()
  if (!secret) throw new Error('Paystack is not configured')
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
  const data = (await res.json()) as { status?: boolean; data?: { status?: string; amount?: number; paid_at?: string } }
  const ok = Boolean(data.status) && data.data?.status === 'success'
  return { paid: ok, amountKobo: Number(data.data?.amount || 0), paidAt: data.data?.paid_at }
}

export async function flutterwaveInitialize(input: { email: string; name: string; amountNgn: number; txRef: string; redirectUrl: string }): Promise<{ link: string }> {
  const secret = await flutterwaveSecret()
  if (!secret) throw new Error('Flutterwave is not configured in Admin > API Keys')
  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tx_ref: input.txRef, amount: input.amountNgn, currency: 'NGN', redirect_url: input.redirectUrl, customer: { email: input.email, name: input.name } }),
  })
  const data = (await res.json()) as { status?: string; message?: string; data?: { link?: string } }
  if (!res.ok || data.status !== 'success' || !data.data?.link) throw new Error(data.message || 'Flutterwave initialize failed')
  return { link: data.data.link }
}

export async function flutterwaveVerify(transactionId: string): Promise<{ paid: boolean; amountNgn: number; txRef?: string }> {
  const secret = await flutterwaveSecret()
  if (!secret) throw new Error('Flutterwave is not configured')
  const res = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
  const data = (await res.json()) as { status?: string; data?: { status?: string; amount?: number; tx_ref?: string } }
  const ok = data.status === 'success' && data.data?.status === 'successful'
  return { paid: ok, amountNgn: Number(data.data?.amount || 0), txRef: data.data?.tx_ref }
}

// ---- server-authoritative activation --------------------------------------

export async function activateSubscription(input: {
  business_id: string
  plan: Row
  billing_cycle: 'monthly' | 'annual'
  provider: string
  provider_reference: string
  amount_ngn: number
  actor_user_id: string
  transaction_id?: string
}): Promise<{ subscription: Row }> {
  const { business_id: businessId, plan, billing_cycle: cycle } = input
  const capacity = Number(plan.capacity_bytes || 0)
  const { data: usage } = await db.from('storage_usage').select('*').eq('business_id', businessId).single()
  const used = Number((usage as unknown as Row | null)?.used_bytes || 0)
  if (used > capacity) {
    throw new Error(`Downgrade blocked: workspace uses ${used} bytes but ${String(plan.name)} provides ${capacity}. Free up space first.`)
  }
  const now = new Date()
  const renews = new Date(now)
  if (cycle === 'annual') renews.setFullYear(renews.getFullYear() + 1)
  else renews.setMonth(renews.getMonth() + 1)
  // Expire previous active storage subscriptions (idempotent re-runs safe).
  const { data: actives } = await db.from('storage_subscriptions').select('*').eq('business_id', businessId).eq('status', 'active').limit(10)
  for (const s of ((actives as unknown as Row[]) || [])) {
    await db.from('storage_subscriptions').update({ status: 'expired', updated_at: now.toISOString() }).eq('id', String(s.id))
  }
  const { data: sub, error } = await db.from('storage_subscriptions').insert({
    business_id: businessId, plan_id: String(plan.id), plan_name: String(plan.name),
    capacity_bytes: capacity, status: 'active', billing_cycle: cycle,
    provider: input.provider, provider_reference: input.provider_reference,
    renews_at: renews.toISOString(), created_at: now.toISOString(), updated_at: now.toISOString(),
  }).select().single()
  if (error || !sub) throw new Error(error?.message || 'Subscription activation failed')
  if (input.transaction_id) {
    await db.from('storage_transactions').update({ status: 'verified', verified_at: now.toISOString(), subscription_id: String((sub as unknown as Row).id) }).eq('id', input.transaction_id)
  }
  await audit(input.actor_user_id, 'storage.subscription_activated', 'storage_subscription', String((sub as unknown as Row).id), {
    business_id: businessId, plan: String(plan.name), cycle, provider: input.provider, amount_ngn: input.amount_ngn,
  })
  await notifyUser({
    recipient_user_id: input.actor_user_id, kind: 'storage_plan_activated',
    title: `Storage plan active: ${String(plan.name)}`,
    message: `Workspace storage is now ${String(plan.name)} (${cycle}). Renews ${renews.toISOString().slice(0, 10)}.`,
    entity_type: 'storage_subscription', entity_id: String((sub as unknown as Row).id),
  })
  return { subscription: sub as unknown as Row }
}

export function paystackSignatureValid(rawBody: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  return hmac === signature
}
