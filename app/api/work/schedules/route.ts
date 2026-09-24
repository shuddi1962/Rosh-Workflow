import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, notifyUser } from '@/lib/operations/server'
import { emitEvent } from '@/lib/operations/events'

const db = new DBClient()

export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'mine' // mine | team | all
    const status = searchParams.get('status') || ''
    const { data, error } = await db.from('work_schedules').select('*').order('due_date', { ascending: true }).limit(500)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    let rows = ((data as unknown as Array<Record<string, unknown>>) || [])
    const today = new Date().toISOString().slice(0, 10)
    // auto-mark overdue (read-model, persisted lazily on update only — compute here)
    rows = rows.map((r) => {
      if ((String(r.status) === 'scheduled' || String(r.status) === 'in_progress') && r.due_date && String(r.due_date).slice(0, 10) < today) {
        return { ...r, status: 'overdue' }
      }
      return r
    })
    if (scope === 'mine') rows = rows.filter((r) => String(r.assigned_to) === auth.user.userId)
    if (status) rows = rows.filter((r) => String(r.status) === status)
    const mine = rows.filter((r) => String(r.assigned_to) === auth.user.userId)
    return NextResponse.json({
      schedules: rows,
      groups: {
        today: mine.filter((r) => String(r.due_date || '').slice(0, 10) <= today && !['completed', 'cancelled'].includes(String(r.status))),
        upcoming: mine.filter((r) => String(r.due_date || '').slice(0, 10) > today && !['completed', 'cancelled'].includes(String(r.status))),
        overdue: mine.filter((r) => String(r.status) === 'overdue'),
        completed: mine.filter((r) => String(r.status) === 'completed'),
      },
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const title = String(body.task_title || body.title || '').trim()
    if (!title) return NextResponse.json({ error: 'task_title is required' }, { status: 400 })
    const assignedTo = String(body.assigned_to || auth.user.userId)
    const { data, error } = await db.from('work_schedules').insert({
      task_title: title,
      description: String(body.description || ''),
      assigned_to: assignedTo,
      assigned_to_name: String(body.assigned_to_name || ''),
      assigned_by: auth.user.userId,
      department: String(body.department || ''),
      priority: String(body.priority || 'medium'),
      status: 'scheduled',
      start_date: body.start_date ? String(body.start_date).slice(0, 10) : null,
      due_date: body.due_date ? String(body.due_date).slice(0, 10) : null,
      related_module: String(body.related_module || 'other'),
      related_project: String(body.related_project || ''),
      progress_notes: '',
      attachment_url: body.attachment_url ? String(body.attachment_url) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const schedId = String((data as unknown as Record<string, unknown>).id)
    await emitEvent(auth.user, {
      event_type: 'task.assigned',
      entity_type: 'work_schedule',
      entity_id: schedId,
      entity_ref: title,
      title: `Task assigned — ${title}`,
      summary: `To ${assignedTo} · due ${String(body.due_date || 'TBD')}`,
      metadata: { title, assignedTo, priority: String(body.priority || 'medium') },
    }, request)
    if (assignedTo !== auth.user.userId) {
      await notifyUser({ recipient_user_id: assignedTo, kind: 'task_assigned', title: 'New task assigned', message: `${title} — due ${String(body.due_date || 'TBD')}`, entity_type: 'work_schedule', entity_id: (data as unknown as Record<string, unknown>).id as string })
    }
    return NextResponse.json({ schedule: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
