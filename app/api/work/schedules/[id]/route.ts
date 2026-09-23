import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, audit, notifyUser } from '@/lib/operations/server'

const db = new DBClient()

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { data: cur, error } = await db.from('work_schedules').select('*').eq('id', params.id).single()
    if (error || !cur) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const current = cur as unknown as Record<string, unknown>
    const body = (await request.json()) as Record<string, unknown>
    const action = String(body.action || 'update')
    const isOwner = String(current.assigned_to) === auth.user.userId
    const isManager = auth.user.role === 'admin'

    const save = async (patch: Record<string, unknown>) => {
      const { data, error: e } = await db.from('work_schedules').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', params.id).select().single()
      if (e) throw new Error(e.message)
      return data
    }

    if (action === 'start') {
      if (!isOwner && !isManager) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const data = await save({ status: 'in_progress' })
      await audit(auth.user.userId, 'schedule.start', 'work_schedule', params.id, {}, request)
      return NextResponse.json({ schedule: data })
    }
    if (action === 'pause' || action === 'hold') {
      if (!isOwner && !isManager) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const data = await save({ status: 'on_hold', progress_notes: body.progress_notes ? `${String(current.progress_notes || '')}\n${String(body.progress_notes)}`.trim() : String(current.progress_notes || '') })
      return NextResponse.json({ schedule: data })
    }
    if (action === 'progress') {
      if (!isOwner && !isManager) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const note = String(body.progress_notes || body.note || '')
      if (!note) return NextResponse.json({ error: 'progress_notes required' }, { status: 400 })
      const data = await save({ progress_notes: `${String(current.progress_notes || '')}\n[${new Date().toISOString().slice(0, 16)}] ${note}`.trim() })
      await audit(auth.user.userId, 'schedule.progress', 'work_schedule', params.id, { note }, request)
      return NextResponse.json({ schedule: data })
    }
    if (action === 'complete') {
      if (!isOwner && !isManager) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const data = await save({ status: 'completed', completed_at: new Date().toISOString(), progress_notes: body.progress_notes ? `${String(current.progress_notes || '')}\n${String(body.progress_notes)}`.trim() : String(current.progress_notes || '') })
      await audit(auth.user.userId, 'schedule.complete', 'work_schedule', params.id, {}, request)
      await notifyUser({ recipient_user_id: String(current.assigned_by || 'manager'), recipient_role: 'manager', kind: 'task_completed', title: 'Task completed', message: `${String(current.task_title)} completed by ${auth.user.name}`, entity_type: 'work_schedule', entity_id: params.id })
      return NextResponse.json({ schedule: data })
    }
    if (action === 'issue') {
      const issue = String(body.issue || body.progress_notes || '')
      if (!issue) return NextResponse.json({ error: 'issue description required' }, { status: 400 })
      const data = await save({ progress_notes: `${String(current.progress_notes || '')}\n[ISSUE ${new Date().toISOString().slice(0, 16)}] ${issue}`.trim() })
      await notifyUser({ recipient_user_id: String(current.assigned_by || 'manager'), recipient_role: 'manager', kind: 'task_issue', title: 'Task issue reported', message: `${String(current.task_title)}: ${issue}`, entity_type: 'work_schedule', entity_id: params.id })
      return NextResponse.json({ schedule: data })
    }
    // manager update / reassign / cancel
    if (!isManager && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const patch: Record<string, unknown> = {}
    for (const k of ['task_title', 'description', 'department', 'priority', 'status', 'start_date', 'due_date', 'related_module', 'related_project', 'attachment_url']) {
      if (body[k] !== undefined) patch[k] = body[k]
    }
    if (isManager && body.assigned_to !== undefined) { patch.assigned_to = String(body.assigned_to); if (body.assigned_to_name !== undefined) patch.assigned_to_name = String(body.assigned_to_name) }
    const data = await save(patch)
    await audit(auth.user.userId, 'schedule.update', 'work_schedule', params.id, { fields: Object.keys(patch) }, request)
    return NextResponse.json({ schedule: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
