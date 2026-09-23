'use client'

import { useEffect, useState } from 'react'
import { Loader2, Building2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Business {
  id: string
  name: string
  slug: string
  industry: string
  email: string
  plan: string
  status: string
  member_count: number
  subscription?: { plan_name: string; status: string } | null
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export default function AdminTenantsPage() {
  const [rows, setRows] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({ plan: 'Starter' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/tenants', { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setRows(data.businesses || [])
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/tenants', { method: 'POST', headers: authHeaders(), body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setShowModal(false); setForm({ plan: 'Starter' }); load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }

  const changePlan = async (id: string, plan: string) => {
    const res = await fetch(`/api/admin/tenants/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ plan }) })
    const data = await res.json()
    if (!res.ok) setError(data.error || 'Failed')
    else load()
  }

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-clash text-3xl font-bold text-text-primary mb-1">Tenants & Plans</h1>
          <p className="text-text-secondary text-sm">Every business on the platform with a plan tailored to its needs. Run the <span className="font-mono">006_multitenant.sql</span> migration first.</p>
        </div>
        <Button onClick={() => { setForm({ plan: 'Starter' }); setShowModal(true) }} className="bg-accent-primary text-white"><Plus className="w-4 h-4 mr-2" />Add business</Button>
      </div>
      {error && <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red mb-4 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border border-border-subtle p-5">
            <div className="flex items-center gap-2 mb-2"><Building2 className="w-5 h-5 text-accent-primary" /><h3 className="font-bold">{b.name}</h3></div>
            <p className="text-xs text-text-muted mb-3">{b.industry || '—'} · {b.email || 'no email'} · {b.member_count} staff</p>
            <div className="flex items-center gap-2 mb-3"><Badge>{b.plan}</Badge><Badge>{b.status}</Badge>{b.subscription && <span className="text-xs text-text-muted">sub: {b.subscription.status}</span>}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">Plan:</span>
              <Select value={b.plan} onValueChange={(v) => changePlan(b.id, v)}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>{['Starter', 'Professional', 'Business', 'Enterprise'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-text-muted">No businesses yet — run migration 006, then add the first business.</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Onboard a business</h3>
            {[['name', 'Business name*'], ['industry', 'Industry'], ['email', 'Contact email'], ['phone', 'Phone']].map(([k, label]) => (
              <div key={k}><label className="text-xs text-text-secondary">{label}</label><Input value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
            <div><label className="text-xs text-text-secondary">Plan (tailored to their needs)</label>
              <Select value={form.plan || 'Starter'} onValueChange={(v) => setForm({ ...form, plan: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Starter', 'Professional', 'Business', 'Enterprise'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button disabled={saving} onClick={create} className="bg-accent-primary text-white">{saving ? 'Saving...' : 'Create'}</Button></div>
          </div>
        </div>
      )}
    </div>
  )
}
