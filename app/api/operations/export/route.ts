import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'

const db = new DBClient()

function csv(rows: Array<Record<string, unknown>>, cols: string[]): string {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')
}

// GET /api/operations/export?type=inventory|receipts|movements|daily|monthly|schedules&format=csv
// Exported files include company header, period, preparer, date generated.
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'inventory'
    const generated = new Date().toISOString()
    const header = `# Roshanal Infotech Limited\n# Report: ${type}\n# Generated: ${generated}\n# Prepared by: ${auth.user.name || auth.user.email} (${auth.user.role})\n`

    if (type === 'inventory') {
      const { data } = await db.from('products').select('*').limit(1000)
      const rows = ((data as unknown as Array<Record<string, unknown>>) || []).map((p) => ({
        sku: p.sku || '', name: p.name, brand: p.brand, category: p.category, division: p.division,
        quantity: p.quantity_on_hand || 0, reorder: p.reorder_level || 0, cost: p.cost_price_naira || '', price: p.price_naira || '',
        supplier: p.supplier || '', status: p.stock_status || '',
      }))
      return new NextResponse(header + csv(rows, ['sku', 'name', 'brand', 'category', 'division', 'quantity', 'reorder', 'cost', 'price', 'supplier', 'status']), {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="inventory-${generated.slice(0, 10)}.csv"` },
      })
    }
    if (type === 'receipts') {
      const { data } = await db.from('receipts').select('*').limit(2000)
      const rows = ((data as unknown as Array<Record<string, unknown>>) || []).map((r) => ({
        code: r.receipt_code, number: r.receipt_number, type: r.document_type, supplier: r.supplier_vendor,
        amount: r.amount_naira, date: String(r.date_received || '').slice(0, 10), holder: r.current_holder, status: r.status,
      }))
      return new NextResponse(header + csv(rows, ['code', 'number', 'type', 'supplier', 'amount', 'date', 'holder', 'status']), {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="receipt-register-${generated.slice(0, 10)}.csv"` },
      })
    }
    if (type === 'movements') {
      const { data } = await db.from('inventory_movements').select('*').limit(2000)
      const rows = ((data as unknown as Array<Record<string, unknown>>) || []).map((m) => ({
        ref: m.reference_number, type: m.movement_type, product: m.product_id, qty: m.quantity,
        prev: m.previous_quantity, new: m.new_quantity, date: String(m.created_at || '').slice(0, 16), by: m.person_responsible,
      }))
      return new NextResponse(header + csv(rows, ['ref', 'type', 'product', 'qty', 'prev', 'new', 'date', 'by']), {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="stock-movements-${generated.slice(0, 10)}.csv"` },
      })
    }
    if (type === 'schedules') {
      const { data } = await db.from('work_schedules').select('*').limit(1000)
      const rows = ((data as unknown as Array<Record<string, unknown>>) || []).map((s) => ({
        task: s.task_title, assigned_to: s.assigned_to_name || s.assigned_to, priority: s.priority,
        status: s.status, due: String(s.due_date || '').slice(0, 10), module: s.related_module,
      }))
      return new NextResponse(header + csv(rows, ['task', 'assigned_to', 'priority', 'status', 'due', 'module']), {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="work-schedule-${generated.slice(0, 10)}.csv"` },
      })
    }
    if (type === 'daily') {
      const date = searchParams.get('date') || generated.slice(0, 10)
      const { data } = await db.from('daily_reports').select('*').eq('report_date', date).limit(500)
      const rows = ((data as unknown as Array<Record<string, unknown>>) || []).map((r) => ({
        date: String(r.report_date).slice(0, 10), employee: r.employee_name, status: r.status,
        summary: String(r.summary || '').slice(0, 200), challenges: String(r.challenges || '').slice(0, 200),
      }))
      return new NextResponse(header + `# Period: ${date}\n` + csv(rows, ['date', 'employee', 'status', 'summary', 'challenges']), {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="daily-reports-${date}.csv"` },
      })
    }
    return NextResponse.json({ error: 'Unknown export type (use inventory|receipts|movements|schedules|daily)' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
