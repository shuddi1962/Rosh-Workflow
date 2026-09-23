import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, audit, notifyUser } from '@/lib/operations/server'

const db = new DBClient()

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// Collect real system activities for auto-filling the daily report (no double entry)
async function collectAutoActivities(userId: string, dateStr: string): Promise<Array<Record<string, string>>> {
  const items: Array<Record<string, string>> = []
  try {
    const { data: mov } = await db.from('inventory_movements').select('*').eq('created_by', userId).limit(200)
    for (const m of ((mov as unknown as Array<Record<string, unknown>>) || []).filter((r) => String(r.created_at || '').slice(0, 10) === dateStr)) {
      items.push({ activity_time: String(m.created_at).slice(11, 16), activity: `Stock ${String(m.movement_type)} (ref ${String(m.reference_number)})`, module: 'inventory', description: `Product ${String(m.product_id)} qty ${String(m.quantity)}`, status: 'completed', result: `New qty ${String(m.new_quantity)}`, remarks: String(m.reason || ''), source: 'auto', source_ref: String(m.id) })
    }
    const { data: rec } = await db.from('receipts').select('*').eq('created_by', userId).limit(200)
    for (const r of ((rec as unknown as Array<Record<string, unknown>>) || []).filter((x) => String(x.created_at || '').slice(0, 10) === dateStr)) {
      items.push({ activity_time: String(r.created_at).slice(11, 16), activity: `Recorded receipt ${String(r.receipt_code)}`, module: 'receipts', description: `${String(r.supplier_vendor)} — ₦${Number(r.amount_naira || 0).toLocaleString()}`, status: 'completed', result: String(r.status), remarks: '', source: 'auto', source_ref: String(r.id) })
    }
    const { data: grn } = await db.from('goods_receipts').select('*').eq('created_by', userId).limit(100)
    for (const g of ((grn as unknown as Array<Record<string, unknown>>) || []).filter((x) => String(x.created_at || '').slice(0, 10) === dateStr)) {
      items.push({ activity_time: String(g.created_at).slice(11, 16), activity: `Goods receipt ${String(g.grn_number)}`, module: 'purchasing', description: `Supplier ${String(g.supplier)}`, status: 'completed', result: String(g.verification_status), remarks: '', source: 'auto', source_ref: String(g.id) })
    }
    const { data: sch } = await db.from('work_schedules').select('*').eq('assigned_to', userId).limit(200)
    for (const s of ((sch as unknown as Array<Record<string, unknown>>) || []).filter((x) => String(x.completed_at || '').slice(0, 10) === dateStr)) {
      items.push({ activity_time: String(s.completed_at).slice(11, 16), activity: `Completed task: ${String(s.task_title)}`, module: String(s.related_module || 'other'), description: String(s.description || ''), status: 'completed', result: 'done', remarks: '', source: 'auto', source_ref: String(s.id) })
    }
  } catch { /* auto-collect must never break report creation */ }
  return items
}

export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'mine'
    const date = searchParams.get('date') || ''
    const status = searchParams.get('status') || ''
    const { data, error } = await db.from('daily_reports').select('*').order('report_date', { ascending: false }).limit(200)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    let rows = ((data as unknown as Array<Record<string, unknown>>) || [])
    if (scope === 'mine') rows = rows.filter((r) => String(r.employee_id) === auth.user.userId)
    if (date) rows = rows.filter((r) => String(r.report_date).slice(0, 10) === date)
    if (status) rows = rows.filter((r) => String(r.status) === status)
    // attach counts
    const { data: itemsRaw } = await db.from('daily_report_items').select('*').limit(2000)
    const allItems = ((itemsRaw as unknown as Array<Record<string, unknown>>) || [])
    const withCounts = rows.map((r) => ({ ...r, item_count: allItems.filter((i) => String(i.daily_report_id) === String(r.id)).length }))
    return NextResponse.json({ reports: withCounts })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const dateStr = body.report_date ? String(body.report_date).slice(0, 10) : todayStr()
    // upsert draft for (date, employee)
    const { data: existing } = await db.from('daily_reports').select('*').eq('report_date', dateStr).eq('employee_id', auth.user.userId).single()
    let report = (existing as unknown as Record<string, unknown>) || null
    if (!report) {
      const { data, error } = await db.from('daily_reports').insert({
        report_date: dateStr,
        employee_id: auth.user.userId,
        employee_name: String(body.employee_name || auth.user.name || auth.user.email),
        department: String(body.department || ''),
        status: 'draft',
        summary: '', challenges: '', actions_taken: '', achievements: '', next_day_plan: '',
        attachments: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      report = data as unknown as Record<string, unknown>
      // auto-collect once
      const auto = await collectAutoActivities(auth.user.userId, dateStr)
      for (const a of auto) {
        await db.from('daily_report_items').insert({ daily_report_id: String(report.id), ...a, created_at: new Date().toISOString() })
      }
    }
    const { data: items } = await db.from('daily_report_items').select('*').eq('daily_report_id', String(report.id)).order('created_at', { ascending: true }).limit(500)
    await audit(auth.user.userId, 'daily_report.open', 'daily_report', String(report.id), { dateStr }, request)
    return NextResponse.json({ report, items: (items as unknown[]) || [] }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
