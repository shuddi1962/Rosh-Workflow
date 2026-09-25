import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId } from '@/lib/drive/server'

const db = new DBClient()

type Row = Record<string, unknown>

async function scopedConversation(businessId: string, id: string): Promise<Row | null> {
  const { data } = await db
    .from('whatsapp_conversations')
    .select('*')
    .eq('id', id)
    .eq('business_id', businessId)
    .limit(1)
  return (((data as unknown as Row[]) || [])[0] as Row | undefined) ?? null
}

// GET /api/whatsapp/conversations/:id/messages — thread + mark inbound read.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const businessId = await resolveBusinessId(auth.user)
    if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
    const conv = await scopedConversation(businessId, params.id)
    if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

    const { data, error } = await db
      .from('whatsapp_messages')
      .select('*')
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true })
      .limit(500)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const messages = ((data as unknown as Row[]) || []).map((m) => ({
      id: String(m.id),
      direction: String(m.direction),
      body: String(m.body || ''),
      status: String(m.status || ''),
      created_at: String(m.created_at),
    }))

    // Opening the thread reads inbound mail (real read receipts for the inbox).
    const now = new Date().toISOString()
    await db
      .from('whatsapp_messages')
      .update({ status: 'read' })
      .eq('conversation_id', params.id)
      .eq('direction', 'inbound')
      .eq('status', 'received')
    await db
      .from('whatsapp_conversations')
      .update({ unread_count: 0, updated_at: now })
      .eq('id', params.id)

    return NextResponse.json({ messages })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
