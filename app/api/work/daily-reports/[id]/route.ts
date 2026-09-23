import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, audit, notifyUser } from '@/lib/operations/server'

const db = new DBClient()

async function getReport(id: string) {
  const { data, error } = await db.from('daily_reports').select('*').eq('id', id).single()
  if (error || !data) return null
  return data as unknown as Record<string, unknown>
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const r = await getReport(params.id)
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (auth.user.role !== 'admin' && String(r.employee_id) !== auth.user.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { data: items } = await db.from('daily_report_items').select('*').eq('daily_report_id', params.id).order('created_at', { ascending: true }).limit(500)
  return NextResponse.json({ report: r, items: (items as unknown[]) || [] })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const r = await getReport(params.id)
    if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    const action = String(body.action || 'save')
    const isOwner = String(r.employee_id) === auth.user.userId
    const isManager = auth.user.role === 'admin'

    const save = async (patch: Record<string, unknown>) => {
      const { data, error } = await db.from('daily_reports').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', params.id).select().single()
      if (error) throw new Error(error.message)
      return data
    }

    if (action === 'add_item') {
      if (!isOwner) return NextResponse.json({ error: 'Only the owner can add items' }, { status: 403 })
      if (!['draft', 'returned'].includes(String(r.status))) return NextResponse.json({ error: `Cannot edit ${String(r.status)} report` }, { status: 400 })
      const activity = String(body.activity || '').trim()
      if (!activity) return NextResponse.json({ error: 'activity is required' }, { status: 400 })
      const { data, error } = await db.from('daily_report_items').insert({
        daily_report_id: params.id,
        activity_time: String(body.activity_time || ''),
        activity,
        module: String(body.module || 'other'),
        description: String(body.description || ''),
        status: String(body.status || 'completed'),
        result: String(body.result || ''),
        remarks: String(body.remarks || ''),
        source: 'manual',
        source_ref: '',
        created_at: new Date().toISOString(),
      }).select().single()
      if (error) throw new Error(error.message)
      return NextResponse.json({ item: data })
    }

    if (action === 'save') {
      if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      if (!['draft', 'returned'].includes(String(r.status))) return NextResponse.json({ error: `Cannot edit ${String(r.status)} report` }, { status: 400 })
      const patch: Record<string, unknown> = {}
      for (const k of ['summary', 'challenges', 'actions_taken', 'achievements', 'next_day_plan', 'department', 'employee_name']) {
        if (body[k] !== undefined) patch[k] = body[k]
      }
      if (body.attachments !== undefined) patch.attachments = body.attachments
      const data = await save(patch)
      return NextResponse.json({ report: data })
    }

    if (action === 'submit') {
      if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      if (!['draft', 'returned'].includes(String(r.status))) return NextResponse.json({ error: `Cannot submit ${String(r.status)} report` }, { status: 400 })
      const data = await save({ status: 'submitted' })
      await audit(auth.user.userId, 'daily_report.submit', 'daily_report', params.id, {}, request)
      await notifyUser({ recipient_user_id: 'manager', recipient_role: 'manager', kind: 'report_submitted', title: 'Daily report submitted', message: `${String(r.employee_name)} submitted ${String(r.report_date).slice(0, 10)} report`, entity_type: 'daily_report', entity_id: params.id })
      return NextResponse.json({ report: data })
    }

    if (action === 'approve' || action === 'review' || action === 'return') {
      if (!isManager) return NextResponse.json({ error: 'Manager access required' }, { status: 403 })
      if (!['submitted', 'reviewed'].includes(String(r.status))) return NextResponse.json({ error: `Cannot review ${String(r.status)} report` }, { status: 400 })
      const comment = String(body.comment || body.review_comment || '')
      if (action === 'return' && !comment) return NextResponse.json({ error: 'Return reason/comment is required' }, { status: 400 })
      const patch: Record<string, unknown> = {
        reviewed_by: auth.user.name || auth.user.email,
        reviewed_at: new Date().toISOString(),
        review_comment: comment,
        status: action === 'approve' ? 'approved' : action === 'review' ? 'reviewed' : 'returned',
      }
      const data = await save(patch)
      await audit(auth.user.userId, `daily_report.${action}`, 'daily_report', params.id, { comment }, request)
      await notifyUser({ recipient_user_id: String(r.employee_id), kind: `report_${action}`, title: `Daily report ${action}`, message: `Your ${String(r.report_date).slice(0, 10)} report was ${action}${comment ? `: ${comment}` : ''}`, entity_type: 'daily_report', entity_id: params.id })
      return NextResponse.json({ report: data })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
