import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, audit } from '@/lib/operations/server'

const db = new DBClient()

function monthRange(ym: string): { from: string; to: string } {
  const [y, m] = ym.split('-').map(Number)
  const from = `${ym}-01`
  const lastDay = new Date(y, m, 0).getDate()
  return { from, to: `${ym}-${String(lastDay).padStart(2, '0')}` }
}

async function compileMonth(ym: string): Promise<Record<string, unknown>> {
  const { from, to } = monthRange(ym)
  const inMonth = (iso: string) => iso.slice(0, 10) >= from && iso.slice(0, 10) <= to

  const [{ data: mov }, { data: rec }, { data: reps }, { data: sch }, { data: prods }, { data: grn }] = await Promise.all([
    db.from('inventory_movements').select('*').limit(2000),
    db.from('receipts').select('*').limit(2000),
    db.from('daily_reports').select('*').limit(1000),
    db.from('work_schedules').select('*').limit(1000),
    db.from('products').select('*').limit(1000),
    db.from('goods_receipts').select('*').limit(1000),
  ])
  const movements = (((mov as unknown as Array<Record<string, unknown>>) || [])).filter((r) => inMonth(String(r.created_at || '')))
  const receipts = (((rec as unknown as Array<Record<string, unknown>>) || [])).filter((r) => inMonth(String(r.created_at || '')))
  const reports = (((reps as unknown as Array<Record<string, unknown>>) || [])).filter((r) => String(r.report_date || '').slice(0, 7) === ym)
  const schedules = (((sch as unknown as Array<Record<string, unknown>>) || []))
  const products = ((prods as unknown as Array<Record<string, unknown>>) || [])
  const grns = (((grn as unknown as Array<Record<string, unknown>>) || [])).filter((r) => inMonth(String(r.created_at || '')))

  const sumBy = (rows: Array<Record<string, unknown>>, type: string) => rows.filter((r) => String(r.movement_type) === type).reduce((s, r) => s + Math.abs(Number(r.quantity || 0)), 0)

  return {
    period: { year_month: ym, from, to },
    inventory: {
      total_skus: products.length,
      total_stock_value_cost: products.reduce((s, p) => s + Number(p.quantity_on_hand || 0) * Number(p.cost_price_naira || 0), 0),
      total_stock_value_price: products.reduce((s, p) => s + Number(p.quantity_on_hand || 0) * Number(p.price_naira || 0), 0),
      low_stock_items: products.filter((p) => Number(p.quantity_on_hand || 0) <= Number(p.reorder_level || 0)).length,
      movements: movements.length,
      received: sumBy(movements, 'received'),
      issued: sumBy(movements, 'issued'),
      sold: sumBy(movements, 'sold'),
      adjustments: sumBy(movements, 'adjustment'),
      damaged: sumBy(movements, 'damaged'),
      goods_receipts: grns.length,
    },
    documents: {
      received: receipts.length,
      submitted: receipts.filter((r) => ['submitted', 'under_review', 'verified', 'approved'].includes(String(r.status))).length,
      verified: receipts.filter((r) => ['verified', 'approved'].includes(String(r.status))).length,
      approved: receipts.filter((r) => String(r.status) === 'approved').length,
      returned: receipts.filter((r) => ['returned', 'rejected'].includes(String(r.status))).length,
      outstanding: receipts.filter((r) => !['approved', 'archived', 'rejected'].includes(String(r.status))).length,
      total_value_naira: receipts.reduce((s, r) => s + Number(r.amount_naira || 0), 0),
    },
    work: {
      assigned: schedules.length,
      completed: schedules.filter((r) => String(r.status) === 'completed').length,
      overdue: schedules.filter((r) => String(r.status) === 'overdue').length,
      daily_reports: reports.length,
      approved_reports: reports.filter((r) => String(r.status) === 'approved').length,
    },
  }
}

export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const { searchParams } = new URL(request.url)
  const ym = searchParams.get('month') || new Date().toISOString().slice(0, 7)
  const { data } = await db.from('monthly_reports').select('*').eq('year_month', ym).single()
  const saved = (data as unknown as Record<string, unknown>) || null
  const live = await compileMonth(ym)
  return NextResponse.json({ month: ym, saved, live })
}

export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const ym = body.month ? String(body.month).slice(0, 7) : new Date().toISOString().slice(0, 7)
    const payload = await compileMonth(ym)
    const { data: existing } = await db.from('monthly_reports').select('*').eq('year_month', ym).single()
    if (existing) {
      const { data, error } = await db.from('monthly_reports').update({
        payload,
        executive_summary: body.executive_summary !== undefined ? String(body.executive_summary) : String((existing as unknown as Record<string, unknown>).executive_summary || ''),
        challenges: body.challenges !== undefined ? String(body.challenges) : String((existing as unknown as Record<string, unknown>).challenges || ''),
        actions_taken: body.actions_taken !== undefined ? String(body.actions_taken) : String((existing as unknown as Record<string, unknown>).actions_taken || ''),
        achievements: body.achievements !== undefined ? String(body.achievements) : String((existing as unknown as Record<string, unknown>).achievements || ''),
        recommendations: body.recommendations !== undefined ? String(body.recommendations) : String((existing as unknown as Record<string, unknown>).recommendations || ''),
        next_month_plan: body.next_month_plan !== undefined ? String(body.next_month_plan) : String((existing as unknown as Record<string, unknown>).next_month_plan || ''),
        updated_at: new Date().toISOString(),
      }).eq('year_month', ym).select().single()
      if (error) throw new Error(error.message)
      await audit(auth.user.userId, 'monthly_report.recompile', 'monthly_report', ym, {}, request)
      return NextResponse.json({ report: data })
    }
    const { data, error } = await db.from('monthly_reports').insert({
      year_month: ym,
      status: 'draft',
      executive_summary: String(body.executive_summary || ''),
      payload,
      challenges: String(body.challenges || ''),
      actions_taken: String(body.actions_taken || ''),
      achievements: String(body.achievements || ''),
      recommendations: String(body.recommendations || ''),
      next_month_plan: String(body.next_month_plan || ''),
      prepared_by: auth.user.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single()
    if (error) throw new Error(error.message)
    await audit(auth.user.userId, 'monthly_report.create', 'monthly_report', ym, {}, request)
    return NextResponse.json({ report: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
