import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'

const db = new DBClient()

type Row = Record<string, unknown>

async function table(tableName: string, limit: number): Promise<Row[]> {
  try {
    const { data } = await db.from(tableName).select('*').order('created_at', { ascending: false }).limit(limit)
    return ((data as unknown as Row[]) || [])
  } catch {
    return []
  }
}

function match(row: Row, q: string): boolean {
  return Object.values(row)
    .filter((v) => typeof v === 'string' || typeof v === 'number')
    .join(' ')
    .toLowerCase()
    .includes(q)
}

// GET /api/search?q=GRN-2026 — one query across the whole business graph.
// Searches products, suppliers, customers, POs, GRNs, receipts, tasks,
// reports, files, leads. Returns grouped hits with deep links.
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url)
    const raw = (searchParams.get('q') || '').trim()
    if (raw.length < 2) {
      return NextResponse.json({ error: 'q must be at least 2 characters' }, { status: 400 })
    }
    const q = raw.toLowerCase()

    const [products, suppliers, customers, pos, grns, receipts, tasks, reports, files, leads] = await Promise.all([
      table('products', 200),
      table('suppliers', 200),
      table('customers', 200),
      table('purchase_orders', 200),
      table('goods_receipts', 200),
      table('receipts', 300),
      table('work_schedules', 300),
      table('daily_reports', 200),
      table('cloud_files', 200),
      table('leads', 200),
    ])

    const pick = (rows: Row[], keys: string[], group: string, href: (r: Row) => string) =>
      rows.filter((r) => match(r, q)).slice(0, 15).map((r) => ({
        group,
        id: String(r.id),
        title: String(r.name || r.title || r.po_number || r.grn_number || r.receipt_code || r.task_title || r.report_date || keys.map((k) => r[k]).filter(Boolean).join(' · ') || r.id),
        subtitle: keys.map((k) => (r[k] ? `${k}: ${String(r[k]).slice(0, 60)}` : '')).filter(Boolean).slice(0, 2).join(' · '),
        href: href(r),
      }))

    const results = [
      ...pick(products, ['sku', 'brand', 'supplier'], 'Products', (r) => '/dashboard/inventory'),
      ...pick(suppliers, ['phone', 'email'], 'Suppliers', () => '/dashboard/inventory'),
      ...pick(customers, ['company', 'phone'], 'Customers', () => '/dashboard/crm'),
      ...pick(pos, ['supplier', 'status'], 'Purchase Orders', () => '/dashboard/inventory'),
      ...pick(grns, ['supplier', 'purchase_order_ref'], 'Goods Receipts', () => '/dashboard/inventory'),
      ...pick(receipts, ['supplier_vendor', 'receipt_number', 'status'], 'Receipts', () => '/dashboard/documents'),
      ...pick(tasks, ['status', 'assigned_to_name'], 'Tasks', () => '/dashboard/work'),
      ...pick(reports, ['employee_name', 'status'], 'Daily Reports', () => '/dashboard/work'),
      ...pick(files, ['mime_type', 'folder_id'], 'Files', () => '/dashboard/drive'),
      ...pick(leads, ['company', 'stage'], 'Leads', () => '/dashboard/crm'),
    ]

    return NextResponse.json({ query: raw, count: results.length, results })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
