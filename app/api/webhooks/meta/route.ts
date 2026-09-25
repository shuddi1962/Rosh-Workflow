import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { extractInbound, extractStatuses, mapProviderStatus, preview } from '@/lib/whatsapp/inbox'

const db = new DBClient()

type Row = Record<string, unknown>

// GET — Meta webhook verification handshake.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  const expected = process.env.META_VERIFY_TOKEN || ''
  if (mode === 'subscribe' && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// POST — persist inbound messages + delivery statuses (real inbox feed).
export async function POST(request: Request) {
  const now = new Date().toISOString()
  try {
    const payload = (await request.json().catch(() => null)) as unknown

    // 1. Delivery / read receipts → update our ledger by provider id.
    for (const s of extractStatuses(payload)) {
      const mapped = mapProviderStatus(s.status)
      if (!mapped || !s.providerId) continue
      await db
        .from('whatsapp_messages')
        .update({ status: mapped })
        .eq('provider_message_id', s.providerId)
    }

    // 2. Inbound text → find-or-create conversation, append, bump unread.
    const inbound = extractInbound(payload)
    if (inbound) {
      let businessId: string | null = null
      if (inbound.phoneNumberId) {
        const { data } = await db
          .from('whatsapp_channels')
          .select('business_id')
          .eq('phone_number_id', inbound.phoneNumberId)
          .eq('is_active', true)
          .limit(1)
        const row = ((data as unknown as Row[]) || [])[0]
        if (row?.business_id) businessId = String(row.business_id)
      }

      let convId: string | null = null
      if (businessId) {
        const { data } = await db
          .from('whatsapp_conversations')
          .select('id,unread_count')
          .eq('business_id', businessId)
          .eq('phone', inbound.from)
          .limit(1)
        const found = ((data as unknown as Row[]) || [])[0]
        if (found) {
          convId = String(found.id)
          await db
            .from('whatsapp_conversations')
            .update({
              unread_count: Number(found.unread_count || 0) + 1,
              last_message_at: inbound.sentAt,
              last_preview: preview(inbound.text),
              updated_at: now,
            })
            .eq('id', convId)
        } else {
          const { data: created } = await db
            .from('whatsapp_conversations')
            .insert({
              id: crypto.randomUUID(),
              business_id: businessId,
              channel: 'whatsapp',
              phone: inbound.from,
              name: '',
              unread_count: 1,
              last_message_at: inbound.sentAt,
              last_preview: preview(inbound.text),
              created_at: now,
              updated_at: now,
            })
            .select()
            .single()
          if (created) convId = String((created as unknown as Row).id)
        }
      } else {
        // Quarantine: unmapped sender number — stored, never listed, never leaked.
        const { data: created } = await db
          .from('whatsapp_conversations')
          .insert({
            id: crypto.randomUUID(),
            business_id: null,
            channel: 'whatsapp',
            phone: inbound.from,
            name: '',
            unread_count: 0,
            last_message_at: inbound.sentAt,
            last_preview: preview(inbound.text),
            created_at: now,
            updated_at: now,
          })
          .select()
          .single()
        if (created) convId = String((created as unknown as Row).id)
      }

      if (convId) {
        await db.from('whatsapp_messages').insert({
          id: crypto.randomUUID(),
          conversation_id: convId,
          business_id: businessId,
          direction: 'inbound',
          body: inbound.text,
          status: 'received',
          provider_message_id: inbound.providerId,
          created_at: inbound.sentAt,
        })
      }
    }

    await db.from('audit_logs').insert({
      id: crypto.randomUUID(),
      user_id: 'system',
      action: 'webhook_received',
      entity_type: 'webhook',
      entity_id: 'meta',
      details: { timestamp: now, inbound: Boolean(inbound) },
      ip_address: '',
      user_agent: 'webhook',
      created_at: now,
    })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
