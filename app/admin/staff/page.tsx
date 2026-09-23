'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DEPARTMENTS, DEPARTMENT_LABELS, STAFF_ROLES, staffRoleLabel, type Department } from '@/lib/roles'

interface Staff {
  id: string
  email: string
  full_name: string
  role: string
  department?: string
  staff_role?: string
  business_id?: string | null
  is_active: boolean
}

interface Business { id: string; name: string; plan: string }

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({ department: 'administration', staff_role: 'viewer', role: 'operator' })
  const [saving, setSaving] = useState(false)
  const [filterDept, setFilterDept] = useState('all')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/staff', { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed — run the 006_multitenant.sql migration first')
      setStaff(data.staff || []); setBusinesses(data.businesses || [])
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/staff', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ ...form, business_id: form.business_id || null }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setShowModal(false); setForm({ department: 'administration', staff_role: 'viewer', role: 'operator' }); load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }

  const reassign = async (id: string, patch: Record<string, string>) => {
    const res = await fetch(`/api/admin/staff/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(patch) })
    const data = await res.json()
    if (!res.ok) setError(data.error || 'Failed')
    else load()
  }

  const visible = filterDept === 'all' ? staff : staff.filter((s) => (s.department || 'administration') === filterDept)

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-clash text-3xl font-bold text-text-primary mb-1">Staff & Roles</h1>
          <p className="text-text-secondary text-sm">Assign each staff member a department and a role based on what the platform offers — the role controls which modules they can open.</p>
        </div>
        <Button onClick={() => { setForm({ department: 'administration', staff_role: 'viewer', role: 'operator' }); setShowModal(true) }} className="bg-accent-primary text-white"><Plus className="w-4 h-4 mr-2" />Add staff</Button>
      </div>
      {error && <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red mb-4 text-sm">{error}</div>}

      <div className="flex gap-3 mb-4 items-center">
        <span className="text-sm text-text-secondary">Department:</span>
        <Select value={filterDept} onValueChange={setFilterDept}><SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All departments</SelectItem>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{DEPARTMENT_LABELS[d]}</SelectItem>)}</SelectContent></Select>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead><tr className="text-left text-text-muted border-b border-border-subtle"><th className="p-3">Staff</th><th className="p-3">Department</th><th className="p-3">Staff role</th><th className="p-3">Business</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id} className="border-b border-border-ghost">
                <td className="p-3"><p className="font-medium">{s.full_name}</p><p className="text-xs text-text-muted">{s.email} · {s.role}</p></td>
                <td className="p-3"><Select value={s.department || 'administration'} onValueChange={(v) => reassign(s.id, { department: v })}><SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{DEPARTMENT_LABELS[d as Department]}</SelectItem>)}</SelectContent></Select></td>
                <td className="p-3"><Select value={s.staff_role || 'viewer'} onValueChange={(v) => reassign(s.id, { staff_role: v })}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent>{STAFF_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent></Select></td>
                <td className="p-3"><Select value={s.business_id || 'none'} onValueChange={(v) => reassign(s.id, { business_id: v === 'none' ? '' : v })}><SelectTrigger className="w-[180px]"><SelectValue placeholder="No business" /></SelectTrigger><SelectContent><SelectItem value="none">No business</SelectItem>{businesses.map((b) => <SelectItem key={b.id} value={b.id}>{b.name} ({b.plan})</SelectItem>)}</SelectContent></Select></td>
                <td className="p-3"><Badge>{s.is_active ? staffRoleLabel(s.staff_role) : 'inactive'}</Badge></td>
              </tr>
            ))}
            {visible.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-text-muted">No staff found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-border-subtle p-5">
        <h3 className="font-bold mb-3 text-sm">What each role can open</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STAFF_ROLES.map((r) => (
            <div key={r.value} className="bg-bg-surface rounded-lg p-3"><p className="font-semibold text-sm">{r.label}</p><p className="text-xs text-text-secondary mb-1">{r.description}</p><p className="text-xs font-mono text-text-muted">{r.modules.join(', ')}</p></div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Add staff member</h3>
            {[['full_name', 'Full name*'], ['email', 'Email*'], ['password', 'Temporary password*']].map(([k, label]) => (
              <div key={k}><label className="text-xs text-text-secondary">{label}</label><Input type={k === 'password' ? 'password' : 'text'} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
            <div><label className="text-xs text-text-secondary">Department (where the staff works)</label><Select value={form.department || 'administration'} onValueChange={(v) => setForm({ ...form, department: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{DEPARTMENT_LABELS[d]}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-xs text-text-secondary">Staff role (what they may open)</label><Select value={form.staff_role || 'viewer'} onValueChange={(v) => setForm({ ...form, staff_role: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STAFF_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label} — {r.description}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-xs text-text-secondary">Business</label><Select value={form.business_id || 'none'} onValueChange={(v) => setForm({ ...form, business_id: v === 'none' ? '' : v })}><SelectTrigger><SelectValue placeholder="No business" /></SelectTrigger><SelectContent><SelectItem value="none">No business</SelectItem>{businesses.map((b) => <SelectItem key={b.id} value={b.id}>{b.name} ({b.plan})</SelectItem>)}</SelectContent></Select></div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button disabled={saving} onClick={create} className="bg-accent-primary text-white">{saving ? 'Saving...' : 'Create staff'}</Button></div>
          </div>
        </div>
      )}
    </div>
  )
}
