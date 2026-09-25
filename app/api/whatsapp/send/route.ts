import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId } from '@/lib/drive/server'
import { createAuditLog } from '@/lib/audit'
import { normalizePhone, validPhone, validBody, preview } from '@/lib/whatsapp/inbox'

const db = new DBClient()

type Row = Record<string, unknown>

async function sendViaMeta(to: string, body: string): Promise<{ ok: boolean; providerId?: string; error?: string }> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || ''
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
  if (!token || !phoneNumberId) {
    return { ok: false, error: 'WhatsApp Cloud API not configured — message queued in inbox' }
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
    })
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) {
      const err = data.error as Record<string, unknown> | undefined
      return { ok: false, error: String(err?.message || `Meta API ${res.status}`) }
    }
    const msgs = data.messages as Array<{ id?: string }> | undefined
    return { ok: true, providerId: msgs?.[0]?.id || '' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Provider unreachable' }
  }
}

// POST /api/whatsapp/send — { conversation_id? | phone?, body* }
// Persists FIRST (never fake success), then attempts the provider.
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const businessId = await resolveBusinessId(auth.user)
    if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
    const payload = (await request.json()) as Record<string, unknown>
    const body = typeof payload.body === 'string' ? payload.body : ''
    if (!validBody(body)) {
      return NextResponse.json({ error: 'Message body (1–4096 chars) is required' }, { status: 400 })
    }

    let conv: Row | null = null
    if (payload.conversation_id) {
      const { data } = await db
        .from('whatsapp_conversations')
        .select('*')
        .eq('id', String(payload.conversation_id))
        .eq('business_id', businessId)
        .limit(1)
      conv = (((data as unknown as Row[]) || [])[0] as Row | undefined) ?? null
      if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    } else {
      const phone = normalizePhone(payload.phone)
      if (!validPhone(phone)) return NextResponse.json({ error: 'conversation_id or a valid phone is required' }, { status: 400 })
      const { data } = await db
        .from('whatsapp_conversations')
        .select('*')
        .eq('business_id', businessId)
        .eq('phone', phone)
        .limit(1)
      conv = (((data as unknown as Row[]) || [])[0] as Row | undefined) ?? null
      if (!conv) {
        const now = new Date().toISOString()
        const { data: created, error } = await db
          .from('whatsapp_conversations')
          .insert({
            id: crypto.randomUUID(),
            business_id: businessId,
            channel: 'whatsapp',
            phone,
            name: String(payload.name || '').trim().slice(0, 120),
            unread_count: 0,
            last_message_at: now,
            last_preview: '',
            created_at: now,
            updated_at: now,
          })
          .select()
          .single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        conv = created as unknown as Row
      }
    }

    const now = new Date().toISOString()
    const { data: msg, error: msgError } = await db
      .from('whatsapp_messages')
      .insert({
        id: crypto.randomUUID(),
        conversation_id: String(conv.id),
        business_id: businessId,
        direction: 'outbound',
        body: body.trim(),
        status: 'queued',
        provider_message_id: '',
        created_at: now,
      })
      .select()
      .single()
    if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 })
    const row = msg as unknown as Row

    const delivery = await sendViaMeta(String(conv.phone), body.trim())
    const finalStatus = delivery.ok ? 'sent' : delivery.error?.includes('not configured') ? 'queued' : 'failed'
    await db
      .from('whatsapp_messages')
      .update({ status: finalStatus, provider_message_id: delivery.providerId || '' })
      .eq('id', String(row.id))
    await db
      .from('whatsapp_conversations')
      .update({ last_message_at: now, last_preview: preview(body.trim()), updated_at: now })
      .eq('id', String(conv.id))

    await createAuditLog({
      user_id: auth.user.userId,
      action: 'whatsapp.message.send',
      entity_type: 'whatsapp_message',
      entity_id: String(row.id),
      details: { conversation_id: String(conv.id), phone: String(conv.phone), status: finalStatus },
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
      user_agent: request.headers.get('user-agent') || '',
    }).catch(() => undefined)

    return NextResponse.json({
      message: {
        id: String(row.id),
        direction: 'outbound',
        body: body.trim(),
        status: finalStatus,
        created_at: now,
      },
      provider: delivery.ok ? 'meta' : 'queued',
      warning: delivery.ok ? undefined : delivery.error,
    }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
