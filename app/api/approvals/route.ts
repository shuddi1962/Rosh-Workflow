import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, notifyUser } from '@/lib/operations/server'
import { emitEvent } from '@/lib/operations/events'

const db = new DBClient()

// GET /api/approvals?status=pending&assigned_to=me
// One reusable approval queue across PO / GRN / receipt / expense /
// daily report / monthly report / work request / document.
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const assigned = searchParams.get('assigned_to') || ''
    const mine = searchParams.get('mine') === 'true'
    const { data, error } = await db.from('approvals').select('*').order('created_at', { ascending: false }).limit(300)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    let rows = ((data as unknown as Array<Record<string, unknown>>) || [])
    if (status) rows = rows.filter((r) => String(r.status) === status)
    if (assigned === 'me' || mine) rows = rows.filter((r) => String(r.assigned_to) === auth.user.userId)
    else if (assigned) rows = rows.filter((r) => String(r.assigned_to) === assigned)
    const pending = rows.filter((r) => String(r.status) === 'pending').length
    return NextResponse.json({ approvals: rows, count: rows.length, pending })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/approvals — request approval for ANY business object.
// { entity_type, entity_id, entity_ref, action, assigned_to }
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const entityType = String(body.entity_type || '').trim()
    const entityId = String(body.entity_id || '').trim()
    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'entity_type and entity_id are required' }, { status: 400 })
    }
    const { data, error } = await db.from('approvals').insert({
      entity_type: entityType,
      entity_id: entityId,
      entity_ref: String(body.entity_ref || ''),
      action: String(body.action || 'approve'),
      status: 'pending',
      requested_by: auth.user.userId,
      requested_by_name: String(auth.user.name || auth.user.email),
      assigned_to: String(body.assigned_to || ''),
      previous_state: String(body.previous_state || ''),
      new_state: String(body.new_state || ''),
      comment: String(body.comment || ''),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const row = data as unknown as Record<string, unknown>
    await emitEvent(auth.user, {
      event_type: 'approval.requested',
      entity_type: entityType,
      entity_id: entityId,
      entity_ref: String(body.entity_ref || ''),
      title: `Approval requested — ${String(body.entity_ref || entityId)}`,
      summary: `Action: ${String(body.action || 'approve')} · by ${auth.user.name}`,
      metadata: { approval_id: String(row.id) },
    }, request)
    const assignee = String(body.assigned_to || '')
    if (assignee && assignee !== auth.user.userId) {
      await notifyUser({
        recipient_user_id: assignee,
        kind: 'approval_requested',
        title: 'Approval requested',
        message: `${String(body.entity_ref || entityId)} needs your ${String(body.action || 'approval')}`,
        entity_type: entityType,
        entity_id: entityId,
      })
    }
    return NextResponse.json({ approval: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
