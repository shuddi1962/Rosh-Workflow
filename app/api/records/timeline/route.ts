import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { recordLinks } from '@/lib/operations/events'

const db = new DBClient()
type Row = Record<string, unknown>

async function byId(tableName: string, id: string): Promise<Row | null> {
  try {
    const { data } = await db.from(tableName).select('*').eq('id', id).single()
    return (data as unknown as Row | null) || null
  } catch {
    return null
  }
}

async function where(tableName: string, column: string, value: string, limit = 100): Promise<Row[]> {
  try {
    const { data } = await db.from(tableName).select('*').eq(column, value).limit(limit)
    return ((data as unknown as Row[]) || [])
  } catch {
    return []
  }
}

const TABLE_FOR: Record<string, string> = {
  purchase_order: 'purchase_orders',
  goods_receipt: 'goods_receipts',
  inventory_movement: 'inventory_movements',
  receipt: 'receipts',
  work_schedule: 'work_schedules',
  daily_report: 'daily_reports',
  product: 'products',
  supplier: 'suppliers',
  customer: 'customers',
  cloud_file: 'cloud_files',
}

// GET /api/records/timeline?entity_type=goods_receipt&entity_id=...
// Universal detail workspace: overview + timeline + links + documents + approvals + activity.
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url)
    const entityType = (searchParams.get('entity_type') || '').trim()
    const entityId = (searchParams.get('entity_id') || '').trim()
    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'entity_type and entity_id are required' }, { status: 400 })
    }
    const tableName = TABLE_FOR[entityType]
    if (!tableName) return NextResponse.json({ error: `Unsupported entity_type: ${entityType}` }, { status: 400 })

    const [record, links, events, audits, approvals, fileLinks] = await Promise.all([
      byId(tableName, entityId),
      recordLinks(entityType, entityId),
      where('business_events', 'entity_id', entityId, 100),
      where('audit_logs', 'entity_id', entityId, 100),
      where('approvals', 'entity_id', entityId, 50),
      where('cloud_file_links', 'entity_id', entityId, 50),
    ])
    if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 })

    // Related business events via graph edges (both directions)
    const relatedEvents = (
      await Promise.all(
        links.slice(0, 20).map((l) => {
          const otherId =
            String(l.source_type) === entityType && String(l.source_id) === entityId
              ? String(l.target_id)
              : String(l.source_id)
          return where('business_events', 'entity_id', otherId, 20)
        })
      )
    ).flat()

    // Timeline: merge events + audits + custody/file history, newest last for reading
    const timeline = [
      ...events.map((e) => ({ at: String(e.created_at), kind: 'event', title: String(e.title), detail: String(e.summary || '') })),
      ...relatedEvents.map((e) => ({ at: String(e.created_at), kind: 'linked_event', title: String(e.title), detail: String(e.summary || '') })),
      ...audits.map((a) => ({ at: String(a.created_at), kind: 'audit', title: String(a.action), detail: JSON.stringify(a.details || {}).slice(0, 160) })),
    ].sort((a, b) => a.at.localeCompare(b.at))

    // Receipt custody history (physical chain of custody)
    let custody: Row[] = []
    if (entityType === 'receipt') {
      custody = await where('receipt_custody_events', 'receipt_id', entityId, 100)
    }
    // GRN line items + movements posted from this GRN
    let items: Row[] = []
    let movements: Row[] = []
    if (entityType === 'goods_receipt') {
      items = await where('goods_receipt_items', 'goods_receipt_id', entityId, 100)
      movements = await where('inventory_movements', 'related_document_id', entityId, 100)
    }

    return NextResponse.json({
      record,
      entity_type: entityType,
      links,
      timeline,
      approvals,
      file_links: fileLinks,
      custody,
      items,
      movements,
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
