import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId } from '@/lib/drive/server'
import { createAuditLog } from '@/lib/audit'
import { normalizePhone, validPhone } from '@/lib/whatsapp/inbox'

const db = new DBClient()

type Row = Record<string, unknown>

function reqMeta(request: Request) {
  return {
    ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
    user_agent: request.headers.get('user-agent') || '',
  };
}

// GET /api/whatsapp/conversations — business-scoped thread list, newest first.
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const businessId = await resolveBusinessId(auth.user)
    if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
    const { data, error } = await db
      .from('whatsapp_conversations')
      .select('*')
      .eq('business_id', businessId)
      .order('last_message_at', { ascending: false })
      .limit(200)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const conversations = ((data as unknown as Row[]) || []).map((c) => ({
      id: String(c.id),
      phone: String(c.phone),
      name: String(c.name || ''),
      unread_count: Number(c.unread_count || 0),
      last_message_at: c.last_message_at ? String(c.last_message_at) : null,
      last_preview: String(c.last_preview || ''),
    }))
    return NextResponse.json({ conversations })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/whatsapp/conversations — { phone*, name? } find-or-create.
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const businessId = await resolveBusinessId(auth.user)
    if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
    const body = (await request.json()) as Record<string, unknown>
    const phone = normalizePhone(body.phone)
    if (!validPhone(phone)) {
      return NextResponse.json({ error: 'A valid phone number is required' }, { status: 400 })
    }
    const name = String(body.name || '').trim().slice(0, 120)

    const { data: existing } = await db
      .from('whatsapp_conversations')
      .select('*')
      .eq('business_id', businessId)
      .eq('phone', phone)
      .limit(1)
    const found = ((existing as unknown as Row[]) || [])[0]
    if (found) {
      if (name && !String(found.name || '')) {
        await db.from('whatsapp_conversations').update({ name, updated_at: new Date().toISOString() }).eq('id', String(found.id))
      }
      return NextResponse.json({
        conversation: {
          id: String(found.id),
          phone: String(found.phone),
          name: String(name || found.name || ''),
          unread_count: Number(found.unread_count || 0),
          last_message_at: found.last_message_at ? String(found.last_message_at) : null,
          last_preview: String(found.last_preview || ''),
        },
        created: false,
      })
    }

    const now = new Date().toISOString()
    const { data, error } = await db
      .from('whatsapp_conversations')
      .insert({
        id: crypto.randomUUID(),
        business_id: businessId,
        channel: 'whatsapp',
        phone,
        name,
        unread_count: 0,
        last_message_at: now,
        last_preview: '',
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const row = data as unknown as Row
    await createAuditLog({
      user_id: auth.user.userId,
      action: 'whatsapp.conversation.open',
      entity_type: 'whatsapp_conversation',
      entity_id: String(row.id),
      details: { phone, name },
      ...reqMeta(request),
    }).catch(() => undefined)
    return NextResponse.json({
      conversation: {
        id: String(row.id),
        phone: String(row.phone),
        name: String(row.name || ''),
        unread_count: 0,
        last_message_at: String(row.last_message_at || now),
        last_preview: '',
      },
      created: true,
    }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
