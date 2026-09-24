import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, notifyUser } from '@/lib/operations/server'
import { emitEvent } from '@/lib/operations/events'

const db = new DBClient()

// PUT /api/approvals/:id — approve / return / reject (human decision only).
// { decision: 'approved' | 'returned' | 'rejected', comment? }
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { data: cur, error } = await db.from('approvals').select('*').eq('id', params.id).single()
    if (error || !cur) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const current = cur as unknown as Record<string, unknown>
    if (String(current.status) !== 'pending') {
      return NextResponse.json({ error: `Already ${String(current.status)}` }, { status: 400 })
    }
    const body = (await request.json()) as Record<string, unknown>
    const decision = String(body.decision || '').trim()
    if (!['approved', 'returned', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: "decision must be 'approved' | 'returned' | 'rejected'" }, { status: 400 })
    }
    if (decision === 'returned' && !String(body.comment || '').trim()) {
      return NextResponse.json({ error: 'A return reason (comment) is required' }, { status: 400 })
    }
    const { data, error: e } = await db.from('approvals').update({
      status: decision === 'approved' ? 'approved' : decision,
      decided_by: auth.user.userId,
      decided_by_name: String(auth.user.name || auth.user.email),
      decision,
      comment: String(body.comment || ''),
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', params.id).select().single()
    if (e) return NextResponse.json({ error: e.message }, { status: 500 })
    await emitEvent(auth.user, {
      event_type: `approval.${decision}`,
      entity_type: String(current.entity_type),
      entity_id: String(current.entity_id),
      entity_ref: String(current.entity_ref || ''),
      title: `Approval ${decision} — ${String(current.entity_ref || current.entity_id)}`,
      summary: `By ${auth.user.name}${body.comment ? ` · ${String(body.comment).slice(0, 160)}` : ''}`,
      metadata: { approval_id: params.id, decision },
    }, request)
    const requester = String(current.requested_by || '')
    if (requester && requester !== auth.user.userId) {
      await notifyUser({
        recipient_user_id: requester,
        kind: `approval_${decision}`,
        title: `Approval ${decision}`,
        message: `${String(current.entity_ref || current.entity_id)} was ${decision} by ${auth.user.name}`,
        entity_type: String(current.entity_type),
        entity_id: String(current.entity_id),
      })
    }
    return NextResponse.json({ approval: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
