import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, audit, notifyUser } from '@/lib/operations/server'

const db = new DBClient()

async function getReceipt(id: string) {
  const { data, error } = await db.from('receipts').select('*').eq('id', id).single()
  if (error || !data) return null
  return data as unknown as Record<string, unknown>
}

async function logEvent(receiptId: string, eventType: string, from: string, to: string, by: string, notes: string) {
  await db.from('receipt_custody_events').insert({
    receipt_id: receiptId,
    event_type: eventType,
    from_holder: from,
    to_holder: to,
    performed_by: by,
    notes,
    created_at: new Date().toISOString(),
  })
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const r = await getReceipt(params.id)
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { data: events } = await db.from('receipt_custody_events').select('*').eq('receipt_id', params.id).order('created_at', { ascending: true }).limit(200)
  return NextResponse.json({ receipt: r, custody_history: (events as unknown[]) || [] })
}

// PUT — edit (while not approved) + workflow actions. Submitted receipts are never silently edited.
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const r = await getReceipt(params.id)
    if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    const action = String(body.action || 'edit')
    const me = auth.user.userId
    const myName = auth.user.name || auth.user.email
    const isAdmin = auth.user.role === 'admin'

    const update = async (patch: Record<string, unknown>) => {
      const { data, error } = await db.from('receipts').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', params.id).select().single()
      if (error) throw new Error(error.message)
      return data
    }

    // --- workflow actions ---
    if (action === 'upload_scan') {
      const url = String(body.attachment_url || '')
      if (!url) return NextResponse.json({ error: 'attachment_url required' }, { status: 400 })
      const data = await update({ attachment_url: url, digital_copy_available: true, status: 'scanned' })
      await logEvent(params.id, 'scanned', String(r.current_holder), String(r.current_holder), me, 'Digital scan attached')
      await audit(me, 'receipt.scan', 'receipt', params.id, {}, request)
      return NextResponse.json({ receipt: data })
    }
    if (action === 'submit') {
      if (!['received', 'with_me', 'scanned', 'pending_submission', 'returned', 'rejected'].includes(String(r.status))) {
        return NextResponse.json({ error: `Cannot submit from status ${String(r.status)}` }, { status: 400 })
      }
      const to = String(body.submitted_to || 'accounts')
      const data = await update({ status: 'submitted', submitted_to: to, submission_date: new Date().toISOString() })
      await logEvent(params.id, 'submitted', String(r.current_holder), to, me, String(body.notes || ''))
      await audit(me, 'receipt.submit', 'receipt', params.id, { to }, request)
      await notifyUser({ recipient_user_id: 'manager', recipient_role: 'manager', kind: 'receipt_submitted', title: 'Receipt submitted', message: `${String(r.receipt_code)} (${String(r.supplier_vendor)}) submitted by ${myName}`, entity_type: 'receipt', entity_id: params.id })
      return NextResponse.json({ receipt: data })
    }
    if (action === 'transfer') {
      const to = String(body.to_holder || '')
      if (!to) return NextResponse.json({ error: 'to_holder required' }, { status: 400 })
      const data = await update({ current_holder: to, holder_since: new Date().toISOString(), physical_storage_location: body.physical_storage_location ? String(body.physical_storage_location) : String(r.physical_storage_location || '') })
      await logEvent(params.id, 'transferred', String(r.current_holder), to, me, String(body.notes || ''))
      await audit(me, 'receipt.transfer', 'receipt', params.id, { from: String(r.current_holder), to }, request)
      return NextResponse.json({ receipt: data })
    }
    if (action === 'verify' || action === 'approve' || action === 'return' || action === 'reject') {
      if (!isAdmin && auth.user.role !== 'operator') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      if (!['submitted', 'under_review', 'verified'].includes(String(r.status)) && (action === 'verify' || action === 'approve')) {
        // allow verify/approve from submitted only (strict chain)
        if (!['submitted', 'under_review'].includes(String(r.status))) return NextResponse.json({ error: `Cannot ${action} from ${String(r.status)}` }, { status: 400 })
      }
      const comment = String(body.comment || body.notes || '')
      if ((action === 'return' || action === 'reject') && !comment) {
        return NextResponse.json({ error: 'A reason/comment is required when returning or rejecting' }, { status: 400 })
      }
      const patch: Record<string, unknown> = {}
      if (action === 'verify') { patch.status = 'verified'; patch.verified_by = myName; patch.verification_date = new Date().toISOString() }
      if (action === 'approve') { patch.status = 'approved'; patch.approved_by = myName; patch.approval_date = new Date().toISOString() }
      if (action === 'return') { patch.status = 'returned' }
      if (action === 'reject') { patch.status = 'rejected' }
      if (action === 'return' || action === 'reject') { patch.notes = `${String(r.notes || '')}\n[Reviewer ${myName}]: ${comment}`.trim() }
      const data = await update(patch)
      await logEvent(params.id, action === 'approve' ? 'approved' : action === 'verify' ? 'verified' : action, String(r.current_holder), String(r.current_holder), me, comment)
      await audit(me, `receipt.${action}`, 'receipt', params.id, { comment }, request)
      await notifyUser({ recipient_user_id: String(r.created_by || r.current_holder), kind: `receipt_${action}`, title: `Receipt ${action}`, message: `${String(r.receipt_code)} was ${action} by ${myName}${comment ? `: ${comment}` : ''}`, entity_type: 'receipt', entity_id: params.id })
      return NextResponse.json({ receipt: data })
    }
    if (action === 'review') {
      const data = await update({ status: 'under_review' })
      await logEvent(params.id, 'under_review', String(r.current_holder), String(r.current_holder), me, String(body.comment || ''))
      return NextResponse.json({ receipt: data })
    }
    if (action === 'archive') {
      const data = await update({ status: 'archived', is_archived: true })
      await logEvent(params.id, 'archived', String(r.current_holder), String(r.current_holder), me, '')
      await audit(me, 'receipt.archive', 'receipt', params.id, {}, request)
      return NextResponse.json({ receipt: data })
    }

    // --- plain edit (blocked once approved; returned must go through resubmit) ---
    if (String(r.status) === 'approved') return NextResponse.json({ error: 'Approved receipts are immutable. Ask a manager to return it first.' }, { status: 400 })
    const editable: Record<string, unknown> = {}
    for (const k of ['receipt_number', 'document_type', 'transaction_date', 'date_received', 'supplier_vendor', 'customer_name', 'department', 'project', 'location', 'amount_naira', 'currency', 'payment_method', 'expense_category', 'purchase_reference', 'purchase_order_ref', 'goods_receipt_ref', 'physical_original_available', 'physical_storage_location', 'filing_reference', 'notes']) {
      if (body[k] !== undefined) editable[k] = body[k]
    }
    if (body.attachment_url !== undefined) { editable.attachment_url = body.attachment_url ? String(body.attachment_url) : null; editable.digital_copy_available = Boolean(body.attachment_url) }
    const data = await update(editable)
    await audit(me, 'receipt.edit', 'receipt', params.id, { fields: Object.keys(editable) }, request)
    return NextResponse.json({ receipt: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
