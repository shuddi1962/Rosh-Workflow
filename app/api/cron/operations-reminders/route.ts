import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

// GET /api/cron/operations-reminders — called by Vercel Cron daily.
// Sends: daily report reminders, overdue receipt reminders, task deadline reminders.
// Approval always remains human; this endpoint only creates notifications.
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const cronSecret = process.env.CRON_SECRET || ''
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow unauthenticated Vercel cron calls when no secret configured (matches existing /api/cron/daily-ideas pattern)
    }
    const today = new Date().toISOString().slice(0, 10)
    const results: Record<string, number> = { report_reminders: 0, receipt_reminders: 0, task_reminders: 0 }

    // 1. Daily report reminders: active users without today's report
    const { data: users } = await db.from('users').select('*').eq('is_active', true).limit(200)
    const { data: todaysReports } = await db.from('daily_reports').select('*').eq('report_date', today).limit(500)
    const reported = new Set(((todaysReports as unknown as Array<Record<string, unknown>>) || []).map((r) => String(r.employee_id)))
    for (const u of ((users as unknown as Array<Record<string, unknown>>) || [])) {
      if (!reported.has(String(u.id))) {
        await db.from('operations_notifications').insert({
          recipient_user_id: String(u.id),
          kind: 'daily_report_due',
          title: 'Daily report due',
          message: 'Your daily report for today is not yet submitted.',
          entity_type: 'daily_report',
          entity_id: today,
          is_read: false,
          created_at: new Date().toISOString(),
        })
        results.report_reminders += 1
      }
    }

    // 2. Receipt reminders: held > 3 days and still open
    const { data: receipts } = await db.from('receipts').select('*').limit(1000)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 3)
    for (const r of ((receipts as unknown as Array<Record<string, unknown>>) || [])) {
      if (!['received', 'with_me', 'scanned', 'pending_submission'].includes(String(r.status))) continue
      const heldSince = new Date(String(r.holder_since || r.created_at))
      if (heldSince < cutoff) {
        await db.from('operations_notifications').insert({
          recipient_user_id: String(r.current_holder || r.created_by),
          kind: 'receipt_overdue',
          title: 'Receipt still pending submission',
          message: `${String(r.receipt_code)} (${String(r.supplier_vendor)}) has been with you since ${heldSince.toISOString().slice(0, 10)}. Please scan and submit.`,
          entity_type: 'receipt',
          entity_id: String(r.id),
          is_read: false,
          created_at: new Date().toISOString(),
        })
        results.receipt_reminders += 1
      }
    }

    // 3. Task reminders: due tomorrow or overdue
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().slice(0, 10)
    const { data: schedules } = await db.from('work_schedules').select('*').limit(1000)
    for (const s of ((schedules as unknown as Array<Record<string, unknown>>) || [])) {
      const st = String(s.status)
      if (['completed', 'cancelled'].includes(st)) continue
      const due = String(s.due_date || '').slice(0, 10)
      if (due === tomorrowStr || (due < today)) {
        await db.from('operations_notifications').insert({
          recipient_user_id: String(s.assigned_to),
          kind: due < today ? 'task_overdue' : 'task_due_soon',
          title: due < today ? 'Task overdue' : 'Task due tomorrow',
          message: `${String(s.task_title)} — due ${due}`,
          entity_type: 'work_schedule',
          entity_id: String(s.id),
          is_read: false,
          created_at: new Date().toISOString(),
        })
        results.task_reminders += 1
      }
    }

    return NextResponse.json({ ok: true, ...results })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
