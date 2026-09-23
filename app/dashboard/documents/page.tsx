'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Receipt, Plus, Search, Download, Eye } from 'lucide-react'
import { naira } from '@/lib/operations/types'
import { downloadExport } from '@/lib/operations/client'

interface R {
  id: string; receipt_code: string; receipt_number: string; document_type: string
  supplier_vendor: string; amount_naira: number; date_received: string
  current_holder: string; status: string; attachment_url?: string | null
  department: string; project: string; submitted_to?: string
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

const STATUSES = ['received', 'with_me', 'scanned', 'pending_submission', 'submitted', 'under_review', 'verified', 'approved', 'returned', 'rejected', 'archived']

export default function DocumentsPage() {
  const [receipts, setReceipts] = useState<R[]>([])
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [mineOnly, setMineOnly] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [detail, setDetail] = useState<{ receipt: Record<string, unknown>; custody_history: Array<Record<string, unknown>> } | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const q = `/api/documents/receipts?limit=300${mineOnly ? '&mine=true' : ''}${status !== 'all' ? `&status=${status}` : ''}&search=${encodeURIComponent(search)}`
      const res = await fetch(q, { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setReceipts(data.receipts || []); setSummary(data.summary || {})
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const create = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/documents/receipts', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ ...form, amount_naira: Number(form.amount_naira || 0) }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setShowModal(false); setForm({}); load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }

  const act = async (id: string, action: string, extra: Record<string, string> = {}) => {
    const res = await fetch(`/api/documents/receipts/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action, ...extra }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); return }
    setDetail(null); load()
  }

  const openDetail = async (id: string) => {
    const res = await fetch(`/api/documents/receipts/${id}`, { headers: authHeaders() })
    const data = await res.json()
    if (res.ok) setDetail(data)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>

  return (
    <div>
      <PageHeader
        eyebrow="Operations · Documents"
        title="Receipt & Document Custody"
        description="Track every physical receipt: who holds it, whether it is scanned, submitted, verified or still outstanding."
        actions={
          <>
            <Button variant="outline" onClick={() => downloadExport('receipts').catch((e) => setError(e instanceof Error ? e.message : 'Export failed'))}><Download className="w-4 h-4 mr-2" />Export register</Button>
            <Button onClick={() => { setForm({}); setShowModal(true) }} className="bg-accent-primary text-white"><Plus className="w-4 h-4 mr-2" />Capture Receipt</Button>
          </>
        }
      />
      {error && <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red mb-4 text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        {[['Total held/open', summary.open || 0], ['Pending submission', summary.pending_submission || 0], ['Submitted', summary.submitted || 0], ['Approved', summary.approved || 0], ['Returned', summary.returned || 0], ['Value', naira(summary.total_value_naira || 0)]].map(([l, v]) => (
          <div key={String(l)} className="bg-white rounded-xl border border-border-subtle p-3"><p className="text-[11px] text-text-secondary">{l}</p><p className="text-lg font-bold font-mono">{String(v)}</p></div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" /><Input placeholder="Search receipt no, supplier..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} className="pl-10" /></div>
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-[200px]"><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        <Button variant="outline" onClick={() => { setMineOnly(!mineOnly); setTimeout(load, 0) }}>{mineOnly ? 'Show all' : 'Receipts I hold'}</Button>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead><tr className="text-left text-text-muted border-b border-border-subtle"><th className="p-3">Receipt</th><th className="p-3">Supplier</th><th className="p-3 text-right">Amount</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r.id} className="border-b border-border-ghost hover:bg-bg-surface/50">
                <td className="p-3"><p className="font-mono font-medium">{r.receipt_code}</p><p className="text-xs text-text-muted">{r.receipt_number || r.document_type}{r.attachment_url ? ' · 📎 scanned' : ' · no scan'}</p></td>
                <td className="p-3">{r.supplier_vendor || '—'}</td>
                <td className="p-3 text-right font-mono">{naira(r.amount_naira)}</td>
                <td className="p-3 text-text-muted">{String(r.date_received).slice(0, 10)}</td>
                <td className="p-3"><Badge>{r.status}</Badge></td>
                <td className="p-3"><div className="flex gap-1 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => openDetail(r.id)}><Eye className="w-3 h-3 mr-1" />View</Button>
                  {['received', 'with_me', 'scanned', 'pending_submission', 'returned'].includes(r.status) && <Button size="sm" onClick={() => act(r.id, 'submit', { submitted_to: 'accounts' })}>Submit</Button>}
                </div></td>
              </tr>
            ))}
            {receipts.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-text-muted"><Receipt className="w-8 h-8 mx-auto mb-2" />No receipts. Capture the first physical receipt.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Capture receipt (mobile-friendly)</h3>
            <p className="text-xs text-text-secondary">1. Photograph/scan → 2. Enter details → 3. Save. Submit later from the table.</p>
            {[['receipt_number', 'Receipt number'], ['supplier_vendor', 'Supplier / vendor*'], ['amount_naira', 'Amount ₦*'], ['transaction_date', 'Transaction date (YYYY-MM-DD)'], ['payment_method', 'Payment method'], ['expense_category', 'Expense category'], ['department', 'Department'], ['project', 'Project'], ['purchase_order_ref', 'PO reference'], ['goods_receipt_ref', 'GRN reference'], ['physical_storage_location', 'Physical filing location'], ['attachment_url', 'Scan / photo URL'], ['notes', 'Notes']].map(([k, label]) => (
              <div key={k}><label className="text-xs text-text-secondary">{label}</label><Input value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
            <div><label className="text-xs text-text-secondary">Document type</label><Select value={form.document_type || 'receipt'} onValueChange={(v) => setForm({ ...form, document_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['receipt', 'invoice', 'payment_slip', 'delivery_note', 'waybill', 'voucher', 'other'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button disabled={saving} onClick={create} className="bg-accent-primary text-white">{saving ? 'Saving...' : 'Save receipt'}</Button></div>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between"><div><h3 className="font-bold text-lg font-mono">{String(detail.receipt.receipt_code)}</h3><p className="text-sm text-text-secondary">{String(detail.receipt.supplier_vendor)} · {naira(Number(detail.receipt.amount_naira || 0))} · <Badge>{String(detail.receipt.status)}</Badge></p></div><Button variant="outline" onClick={() => setDetail(null)}>Close</Button></div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[['Physical original', detail.receipt.physical_original_available ? 'Yes' : 'No'], ['Digital copy', detail.receipt.digital_copy_available ? 'Yes' : 'No'], ['Storage', String(detail.receipt.physical_storage_location || '—')], ['Submitted to', String(detail.receipt.submitted_to || '—')], ['Verified by', String(detail.receipt.verified_by || '—')], ['Approved by', String(detail.receipt.approved_by || '—')]].map(([k, v]) => (
                <div key={k} className="bg-bg-surface rounded-lg p-2"><p className="text-[11px] text-text-muted">{k}</p><p className="font-medium">{v}</p></div>
              ))}
            </div>
            {detail.receipt.attachment_url ? <a className="text-accent-primary text-sm underline" href={String(detail.receipt.attachment_url)} target="_blank" rel="noreferrer">Open scan / attachment</a> : <p className="text-xs text-text-muted">No digital scan attached yet.</p>}
            <div><h4 className="font-semibold text-sm mb-2">Custody history (audit trail)</h4><div className="space-y-1">{(detail.custody_history || []).map((e, i) => (<p key={i} className="text-xs text-text-secondary font-mono">{String(e.created_at).slice(0, 16).replace('T', ' ')} · {String(e.event_type)} · {String(e.notes || '')}</p>))}{(detail.custody_history || []).length === 0 && <p className="text-xs text-text-muted">No events.</p>}</div></div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => act(String(detail.receipt.id), 'upload_scan', { attachment_url: prompt('Paste scan/photo URL:') || '' })}>Upload scan</Button>
              <Button size="sm" onClick={() => act(String(detail.receipt.id), 'submit', { submitted_to: 'accounts' })}>Submit</Button>
              <Button size="sm" variant="outline" onClick={() => act(String(detail.receipt.id), 'review')}>Under review</Button>
              <Button size="sm" variant="outline" onClick={() => act(String(detail.receipt.id), 'verify')}>Verify</Button>
              <Button size="sm" onClick={() => act(String(detail.receipt.id), 'approve')}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => { const c = prompt('Return reason (required):'); if (c) act(String(detail.receipt.id), 'return', { comment: c }) }}>Return</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
