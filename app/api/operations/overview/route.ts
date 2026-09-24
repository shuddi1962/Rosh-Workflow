import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'

const db = new DBClient()

// GET /api/operations/overview — real KPIs only, no fabricated numbers
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const me = auth.user.userId
    const today = new Date().toISOString().slice(0, 10)
    const [prods, movs, recs, schs, reps, notifs, approvals, events] = await Promise.all([
      db.from('products').select('*').limit(1000),
      db.from('inventory_movements').select('*').limit(1000),
      db.from('receipts').select('*').limit(1000),
      db.from('work_schedules').select('*').limit(500),
      db.from('daily_reports').select('*').limit(500),
      db.from('operations_notifications').select('*').eq('recipient_user_id', me).limit(100),
      db.from('approvals').select('*').limit(200),
      db.from('business_events').select('*').order('created_at', { ascending: false }).limit(15),
    ])
    const products = ((prods.data as unknown as Array<Record<string, unknown>>) || [])
    const movements = ((movs.data as unknown as Array<Record<string, unknown>>) || [])
    const receipts = ((recs.data as unknown as Array<Record<string, unknown>>) || [])
    const schedules = ((schs.data as unknown as Array<Record<string, unknown>>) || [])
    const reports = ((reps.data as unknown as Array<Record<string, unknown>>) || [])
    const notifications = (((notifs.data as unknown as Array<Record<string, unknown>>) || [])).filter((n) => !n.is_read)
    const approvalRows = ((approvals.data as unknown as Array<Record<string, unknown>>) || [])
    const eventRows = ((events.data as unknown as Array<Record<string, unknown>>) || [])

    const mySchedules = schedules.filter((s) => String(s.assigned_to) === me)
    const myReceipts = receipts.filter((r) => String(r.current_holder) === me)
    const myReportToday = reports.find((r) => String(r.employee_id) === me && String(r.report_date).slice(0, 10) === today)

    return NextResponse.json({
      inventory: {
        total_skus: products.length,
        stock_value_cost: products.reduce((s, p) => s + Number(p.quantity_on_hand || 0) * Number(p.cost_price_naira || 0), 0),
        low_stock: products.filter((p) => Number(p.quantity_on_hand || 0) <= Number(p.reorder_level || 0)).length,
        movements_today: movements.filter((m) => String(m.created_at || '').slice(0, 10) === today).length,
      },
      documents: {
        with_me: myReceipts.filter((r) => ['received', 'with_me', 'scanned', 'pending_submission'].includes(String(r.status))).length,
        pending_submission: receipts.filter((r) => ['received', 'with_me', 'scanned', 'pending_submission'].includes(String(r.status))).length,
        awaiting_verification: receipts.filter((r) => ['submitted', 'under_review'].includes(String(r.status))).length,
        overdue_held: myReceipts.filter((r) => ['received', 'with_me', 'scanned', 'pending_submission'].includes(String(r.status))).length,
      },
      work: {
        today_tasks: mySchedules.filter((s) => String(s.due_date || '').slice(0, 10) <= today && !['completed', 'cancelled'].includes(String(s.status))).length,
        overdue_tasks: mySchedules.filter((s) => String(s.status) === 'overdue' || (String(s.due_date || '').slice(0, 10) < today && !['completed', 'cancelled'].includes(String(s.status)))).length,
        daily_report_status: myReportToday ? String(myReportToday.status) : 'not_started',
        team_pending_reports: auth.user.role === 'admin' ? reports.filter((r) => String(r.status) === 'submitted').length : 0,
      },
      notifications: notifications.slice(0, 10),
      unread_count: notifications.length,
      approvals_pending: approvalRows.filter((a) => String(a.status) === 'pending').length,
      approvals_mine: approvalRows.filter((a) => String(a.status) === 'pending' && String(a.assigned_to) === me).length,
      recent_events: eventRows.slice(0, 10).map((e) => ({ title: String(e.title), summary: String(e.summary || ''), at: String(e.created_at), entity_type: String(e.entity_type), entity_id: String(e.entity_id) })),
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
