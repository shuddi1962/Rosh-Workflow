import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { emitEvent } from '@/lib/operations/events'

const db = new DBClient()

// POST /api/records/links — link any two business objects (no duplication).
// { source_type, source_id, target_type, target_id, link_type? }
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const sourceType = String(body.source_type || '').trim()
    const sourceId = String(body.source_id || '').trim()
    const targetType = String(body.target_type || '').trim()
    const targetId = String(body.target_id || '').trim()
    if (!sourceType || !sourceId || !targetType || !targetId) {
      return NextResponse.json({ error: 'source_type, source_id, target_type, target_id are required' }, { status: 400 })
    }
    const { data, error } = await db.from('record_links').insert({
      source_type: sourceType,
      source_id: sourceId,
      target_type: targetType,
      target_id: targetId,
      link_type: String(body.link_type || 'related'),
      created_by: auth.user.userId,
      created_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await emitEvent(auth.user, {
      event_type: 'record.linked',
      entity_type: sourceType,
      entity_id: sourceId,
      title: `Record linked — ${sourceType} ↔ ${targetType}`,
      summary: `Link: ${String(body.link_type || 'related')}`,
      related_entity_type: targetType,
      related_entity_id: targetId,
    }, request)
    return NextResponse.json({ link: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
