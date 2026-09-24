'use client'

import { useEffect, useState } from 'react'
import { Loader2, Cloud, Check, X, HardDrive, CreditCard, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function fmtBytes(n: number): string {
  if (!n || n <= 0) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)))
  const v = n / Math.pow(1024, i)
  return `${v >= 100 ? Math.round(v) : v.toFixed(1)} ${u[i]}`
}

export default function AdminStoragePage() {
  const [data, setData] = useState<{ totals?: Record<string, number>; workspaces?: Array<Record<string, unknown>>; plans?: Array<Record<string, unknown>>; transactions?: Array<Record<string, unknown>> } | null>(null)
  const [settings, setSettings] = useState<Record<string, { is_enabled: boolean; value: Record<string, unknown> }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [o, s] = await Promise.all([
        fetch('/api/admin/storage', { headers: authHeaders() }).then((r) => r.json().then((d) => ({ ok: r.ok, d }))),
        fetch('/api/admin/storage/settings', { headers: authHeaders() }).then((r) => r.json()),
      ])
      if (!o.ok) throw new Error(o.d.error || 'Failed')
      setData(o.d)
      setSettings(s.settings || {})
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const api = async (url: string, opts?: RequestInit) => {
    const r = await fetch(url, { ...opts, headers: { ...authHeaders(), ...(opts?.headers || {}) } })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || d.warning || 'Request failed')
    return d
  }

  const savePlan = async () => {
    setBusy(true)
    try {
      const payload: Record<string, unknown> = { ...form }
      for (const k of ['rank', 'capacity_bytes', 'price_monthly_ngn', 'price_annual_ngn', 'max_file_bytes', 'max_users', 'retention_days']) {
        if (payload[k] !== undefined && payload[k] !== '') payload[k] = Number(payload[k])
      }
      if (typeof payload.features === 'string') payload.features = String(payload.features).split('\n').map((s) => s.trim()).filter(Boolean)
      if (editing) await api(`/api/admin/storage/plans/${String(editing.id)}`, { method: 'PUT', body: JSON.stringify(payload) })
      else await api('/api/admin/storage/plans', { method: 'POST', body: JSON.stringify(payload) })
      setEditing(null); setShowNew(false); setForm({}); setNotice('Plan saved.'); load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  const activate = async (businessId: string, planId: string, cycle: string) => {
    setBusy(true)
    try {
      await api('/api/admin/storage/subscriptions', { method: 'POST', body: JSON.stringify({ business_id: businessId, plan_id: planId, billing_cycle: cycle }) })
      setNotice('Subscription activated.'); load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Activation failed')
    } finally {
      setBusy(false)
    }
  }

  const saveSetting = async (key: string, patch: { is_enabled?: boolean; value?: Record<string, unknown> }) => {
    try {
      await api('/api/admin/storage/settings', { method: 'PUT', body: JSON.stringify({ key, ...patch }) })
      setNotice('Setting saved.'); load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Setting failed')
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-1"><Cloud className="w-6 h-6 text-accent-primary" /><h1 className="font-clash text-3xl font-bold text-text-primary">Cloud Storage</h1></div>
      <p className="text-text-secondary text-sm mb-5">Plans, workspace usage, subscriptions and drive policies. Prices here drive the user-facing upgrade flow.</p>
      {error && <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red mb-4 text-sm">{error} <button onClick={() => setError('')} className="ml-2 underline">dismiss</button></div>}
      {notice && <div className="bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg p-3 text-accent-emerald mb-4 text-sm">{notice} <button onClick={() => setNotice('')} className="ml-2 underline">dismiss</button></div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Workspaces', value: String(data?.totals?.workspaces || 0) },
          { label: 'Used', value: fmtBytes(Number(data?.totals?.used_bytes || 0)) },
          { label: 'Allocated', value: fmtBytes(Number(data?.totals?.capacity_bytes || 0)) },
          { label: 'Utilization', value: `${Number(data?.totals?.capacity_bytes || 0) ? Math.round((Number(data?.totals?.used_bytes || 0) / Number(data?.totals?.capacity_bytes || 1)) * 100) : 0}%` },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-border-subtle p-4 text-center">
            <p className="text-2xl font-bold font-mono text-text-primary">{k.value}</p>
            <p className="text-xs text-text-muted mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-5 mb-6">
        <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2"><HardDrive className="w-4 h-4" /> Workspace usage</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-text-muted border-b border-border-subtle"><th className="py-2 pr-3">Workspace</th><th className="py-2 pr-3">Plan</th><th className="py-2 pr-3">Used</th><th className="py-2 pr-3">Files</th><th className="py-2 pr-3">Change plan</th></tr></thead>
            <tbody>
              {(data?.workspaces || []).map((w) => (
                <tr key={String(w.id)} className="border-b border-border-ghost">
                  <td className="py-2 pr-3 text-text-primary font-medium">{String(w.name)}<span className="block text-xs text-text-muted font-normal">{String(w.email || '')}</span></td>
                  <td className="py-2 pr-3 text-text-secondary">{String(w.plan_name)} · {fmtBytes(Number(w.capacity_bytes || 0))}</td>
                  <td className="py-2 pr-3 font-mono text-text-primary">{fmtBytes(Number(w.used_bytes || 0))}</td>
                  <td className="py-2 pr-3 text-text-secondary">{String(w.file_count || 0)}</td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-1">
                      <select id={`plan-${String(w.id)}`} className="text-xs border border-border-subtle rounded-lg px-2 py-1.5 bg-white text-text-primary" defaultValue="">
                        <option value="" disabled>Select plan</option>
                        {(data?.plans || []).filter((p) => p.is_active !== false).map((p) => <option key={String(p.id)} value={String(p.id)}>{String(p.name)} — {fmtBytes(Number(p.capacity_bytes || 0))}</option>)}
                      </select>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => {
                        const sel = document.getElementById(`plan-${String(w.id)}`) as HTMLSelectElement | null
                        if (sel?.value) activate(String(w.id), sel.value, 'monthly')
                      }}>Activate</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-text-primary flex items-center gap-2"><CreditCard className="w-4 h-4" /> Storage plans</h3>
          <Button size="sm" onClick={() => { setShowNew(true); setEditing(null); setForm({ currency: 'NGN' }) }}>New plan</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {(data?.plans || []).map((p) => (
            <div key={String(p.id)} className={`rounded-xl border p-4 ${p.is_active === false ? 'opacity-50 border-border-subtle' : 'border-border-default'}`}>
              <h4 className="font-bold text-text-primary">{String(p.name)}</h4>
              <p className="font-mono text-sm text-text-primary">₦{Number(p.price_monthly_ngn || 0).toLocaleString()}/mo · ₦{Number(p.price_annual_ngn || 0).toLocaleString()}/yr</p>
              <p className="text-xs text-text-muted">{fmtBytes(Number(p.capacity_bytes || 0))} · max file {fmtBytes(Number(p.max_file_bytes || 0))} · {String(p.retention_days)}d retention · {String(p.max_users)} users</p>
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" onClick={() => {
                  setEditing(p); setShowNew(false)
                  setForm({ ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, Array.isArray(v) ? (v as string[]).join('\n') : String(v ?? '')])) })
                }}>Edit</Button>
              </div>
            </div>
          ))}
        </div>
        {(showNew || editing) && (
          <div className="mt-4 border border-border-subtle rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {[['name', 'Name'], ['capacity_bytes', 'Capacity (bytes)'], ['price_monthly_ngn', 'Price monthly ₦'], ['price_annual_ngn', 'Price annual ₦'], ['max_file_bytes', 'Max file (bytes)'], ['max_users', 'Max users'], ['retention_days', 'Retention (days)'], ['rank', 'Rank']].map(([k, label]) => (
              <div key={k}><label className="text-xs text-text-secondary">{label}</label><Input value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
            <div className="col-span-2 md:col-span-4"><label className="text-xs text-text-secondary">Features (one per line)</label><Input value={form.features || ''} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder={'100 GB workspace storage\n2 GB max file size'} /></div>
            <div className="col-span-2 md:col-span-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowNew(false); setEditing(null); setForm({}) }}>Cancel</Button>
              <Button disabled={busy} onClick={savePlan} className="bg-accent-primary text-white">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save plan'}</Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-5 mb-6">
        <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2"><Settings2 className="w-4 h-4" /> Drive policies</h3>
        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-2 text-text-primary">
            <input type="checkbox" checked={Boolean(settings.drive_public_links_enabled?.is_enabled)} onChange={(e) => saveSetting('drive_public_links_enabled', { is_enabled: e.target.checked })} />
            Allow public share links (off = owner links need admin role)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-xs w-56">Default trash retention (days)</span>
            <Input type="number" value={String((settings.drive_trash_retention_days?.value as Record<string, unknown> | undefined)?.days ?? 30)} onChange={(e) => saveSetting('drive_trash_retention_days', { is_enabled: true, value: { days: Number(e.target.value) } })} className="max-w-[120px]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-xs w-56">Payment provider (secrets in API Keys vault)</span>
            <select value={String((settings.drive_payment_provider?.value as Record<string, unknown> | undefined)?.provider || 'none')} onChange={(e) => saveSetting('drive_payment_provider', { is_enabled: true, value: { provider: e.target.value } })} className="text-xs border border-border-subtle rounded-lg px-2 py-1.5 bg-white text-text-primary">
              <option value="none">None (manual activation)</option>
              <option value="paystack">Paystack</option>
              <option value="flutterwave">Flutterwave</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-5">
        <h3 className="font-bold text-text-primary mb-3">Recent storage payments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-text-muted border-b border-border-subtle"><th className="py-2 pr-3">Date</th><th className="py-2 pr-3">Plan</th><th className="py-2 pr-3">Amount</th><th className="py-2 pr-3">Provider</th><th className="py-2 pr-3">Status</th></tr></thead>
            <tbody>
              {(data?.transactions || []).map((t) => (
                <tr key={String(t.id)} className="border-b border-border-ghost">
                  <td className="py-2 pr-3 text-text-secondary">{String(t.created_at || '').slice(0, 10)}</td>
                  <td className="py-2 pr-3 text-text-primary">{String(t.plan_name)} ({String(t.billing_cycle)})</td>
                  <td className="py-2 pr-3 font-mono text-text-primary">₦{Number(t.amount_ngn || 0).toLocaleString()}</td>
                  <td className="py-2 pr-3 text-text-secondary">{String(t.provider)}</td>
                  <td className="py-2 pr-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${String(t.status) === 'verified' ? 'bg-accent-emerald/15 text-accent-emerald' : String(t.status) === 'failed' ? 'bg-accent-red/15 text-accent-red' : 'bg-accent-gold/15 text-accent-gold'}`}>
                      {String(t.status) === 'verified' ? <Check className="w-3 h-3 inline" /> : String(t.status) === 'failed' ? <X className="w-3 h-3 inline" /> : null} {String(t.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {(data?.transactions || []).length === 0 && <tr><td colSpan={5} className="py-4 text-center text-xs text-text-muted">No storage payments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
