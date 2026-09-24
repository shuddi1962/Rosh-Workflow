import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { emitEvent, linkRecords } from '@/lib/operations/events'
import { generateReference } from '@/lib/operations/types'

const db = new DBClient()

// GET /api/documents/receipts?holder=me&status=&supplier=&date_from=&date_to=&min_amount=&max_amount=&department=&project=&search=&limit=
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit') || 300), 1000)
    const { data, error } = await db.from('receipts').select('*').order('created_at', { ascending: false }).limit(limit)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    let rows = ((data as unknown as Array<Record<string, unknown>>) || [])

    const holder = searchParams.get('holder') || ''
    const status = searchParams.get('status') || ''
    const supplier = (searchParams.get('supplier') || '').toLowerCase()
    const search = (searchParams.get('search') || '').toLowerCase()
    const dept = (searchParams.get('department') || '').toLowerCase()
    const project = (searchParams.get('project') || '').toLowerCase()
    const dateFrom = searchParams.get('date_from') || ''
    const dateTo = searchParams.get('date_to') || ''
    const minAmt = Number(searchParams.get('min_amount') || '')
    const maxAmt = Number(searchParams.get('max_amount') || '')
    const mineOnly = searchParams.get('mine') === 'true'

    if (holder === 'me' || mineOnly) {
      const me = auth.user.userId
      const myName = (auth.user.name || '').toLowerCase()
      rows = rows.filter((r) => String(r.current_holder) === me || String(r.current_holder || '').toLowerCase() === myName)
    } else if (holder) {
      rows = rows.filter((r) => String(r.current_holder || '').toLowerCase().includes(holder.toLowerCase()))
    }
    if (status) rows = rows.filter((r) => String(r.status) === status)
    if (supplier) rows = rows.filter((r) => String(r.supplier_vendor || '').toLowerCase().includes(supplier))
    if (dept) rows = rows.filter((r) => String(r.department || '').toLowerCase().includes(dept))
    if (project) rows = rows.filter((r) => String(r.project || '').toLowerCase().includes(project))
    if (dateFrom) rows = rows.filter((r) => String(r.date_received || '') >= dateFrom)
    if (dateTo) rows = rows.filter((r) => String(r.date_received || '') <= dateTo)
    if (!Number.isNaN(minAmt) && searchParams.get('min_amount')) rows = rows.filter((r) => Number(r.amount_naira || 0) >= minAmt)
    if (!Number.isNaN(maxAmt) && searchParams.get('max_amount')) rows = rows.filter((r) => Number(r.amount_naira || 0) <= maxAmt)
    if (search) {
      rows = rows.filter((r) =>
        `${String(r.receipt_code || '')} ${String(r.receipt_number || '')} ${String(r.supplier_vendor || '')} ${String(r.notes || '')}`.toLowerCase().includes(search)
      )
    }

    const open = rows.filter((r) => !['approved', 'archived', 'rejected'].includes(String(r.status)))
    const totalValue = rows.reduce((s, r) => s + Number(r.amount_naira || 0), 0)
    return NextResponse.json({
      receipts: rows,
      count: rows.length,
      summary: {
        total: rows.length,
        open: open.length,
        pending_submission: rows.filter((r) => ['received', 'with_me', 'scanned', 'pending_submission'].includes(String(r.status))).length,
        submitted: rows.filter((r) => ['submitted', 'under_review'].includes(String(r.status))).length,
        approved: rows.filter((r) => String(r.status) === 'approved').length,
        returned: rows.filter((r) => ['returned', 'rejected'].includes(String(r.status))).length,
        total_value_naira: totalValue,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// POST — record a physical receipt (digital copy optional; OCR-ready via optional ocr_text passthrough in notes)
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const amount = Number(body.amount_naira || 0)
    if (!body.supplier_vendor && !body.receipt_number) {
      return NextResponse.json({ error: 'supplier_vendor or receipt_number is required' }, { status: 400 })
    }
    if (Number.isNaN(amount) || amount < 0) return NextResponse.json({ error: 'amount_naira must be >= 0' }, { status: 400 })

    const code = generateReference('RC')
    const attachmentUrl = body.attachment_url ? String(body.attachment_url) : null
    const { data, error } = await db.from('receipts').insert({
      receipt_code: code,
      receipt_number: String(body.receipt_number || ''),
      document_type: String(body.document_type || 'receipt'),
      transaction_date: body.transaction_date ? String(body.transaction_date) : null,
      date_received: body.date_received ? String(body.date_received) : new Date().toISOString().slice(0, 10),
      supplier_vendor: String(body.supplier_vendor || ''),
      customer_name: String(body.customer_name || ''),
      department: String(body.department || ''),
      project: String(body.project || ''),
      location: String(body.location || ''),
      amount_naira: amount,
      currency: String(body.currency || 'NGN'),
      payment_method: String(body.payment_method || ''),
      expense_category: String(body.expense_category || ''),
      purchase_reference: String(body.purchase_reference || ''),
      purchase_order_ref: String(body.purchase_order_ref || ''),
      goods_receipt_ref: String(body.goods_receipt_ref || ''),
      received_by: String(body.received_by || auth.user.name || auth.user.email),
      current_holder: auth.user.userId,
      physical_original_available: body.physical_original_available !== false,
      digital_copy_available: Boolean(attachmentUrl),
      physical_storage_location: String(body.physical_storage_location || ''),
      filing_reference: String(body.filing_reference || ''),
      holder_since: new Date().toISOString(),
      notes: String(body.notes || ''),
      status: attachmentUrl ? 'scanned' : 'with_me',
      attachment_url: attachmentUrl,
      supporting_docs: Array.isArray(body.supporting_docs) ? body.supporting_docs : [],
      is_archived: false,
      created_by: auth.user.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const created = data as unknown as Record<string, unknown>
    await db.from('receipt_custody_events').insert({
      receipt_id: String(created.id),
      event_type: 'received',
      from_holder: '',
      to_holder: auth.user.userId,
      performed_by: auth.user.userId,
      notes: `Received from ${String(body.supplier_vendor || 'vendor')}`,
      created_at: new Date().toISOString(),
    })
    await emitEvent(auth.user, {
      event_type: 'receipt.received',
      entity_type: 'receipt',
      entity_id: String(created.id),
      entity_ref: code,
      title: `Receipt captured — ${code}`,
      summary: `${String(body.supplier_vendor || 'vendor')} · ₦${Number(amount || 0).toLocaleString()}`,
      metadata: { supplier: String(body.supplier_vendor || ''), amount, goods_receipt_ref: String(body.goods_receipt_ref || ''), purchase_order_ref: String(body.purchase_order_ref || '') },
      related_entity_type: 'supplier',
      related_entity_ref: String(body.supplier_vendor || ''),
    }, request)
    if (body.goods_receipt_ref) {
      await linkRecords({ source_type: 'goods_receipt_ref', source_id: String(body.goods_receipt_ref), target_type: 'receipt', target_id: String(created.id), link_type: 'documented_by', created_by: auth.user.userId })
    }
    await linkRecords({ source_type: 'supplier', source_id: String(body.supplier_vendor || 'vendor'), target_type: 'receipt', target_id: String(created.id), link_type: 'issued', created_by: auth.user.userId })
    return NextResponse.json({ receipt: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
