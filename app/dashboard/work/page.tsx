'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CalendarCheck, FileText, Plus, Download } from 'lucide-react'
import { downloadExport } from '@/lib/operations/client'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

interface Schedule { id: string; task_title: string; status: string; priority: string; due_date?: string | null; assigned_to_name?: string; related_module?: string; description?: string }
interface Report { id: string; report_date: string; employee_name: string; status: string; item_count?: number }

export default function WorkPage() {
  const [tab, setTab] = useState<'schedule' | 'daily' | 'monthly' | 'team'>('schedule')
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [groups, setGroups] = useState<Record<string, Schedule[]>>({})
  const [reports, setReports] = useState<Report[]>([])
  const [teamReports, setTeamReports] = useState<Report[]>([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [monthly, setMonthly] = useState<{ saved: Record<string, unknown> | null; live: Record<string, unknown> } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Record<string, string>>({})
  const [showTask, setShowTask] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openReport, setOpenReport] = useState<{ report: Record<string, unknown>; items: Array<Record<string, unknown>> } | null>(null)
  const [newItem, setNewItem] = useState<Record<string, string>>({})
  const [isAdmin, setIsAdmin] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const me = await fetch('/api/auth/me', { headers: authHeaders() }).then((r) => r.json()).catch(() => ({ user: null }))
      setIsAdmin(me?.user?.role === 'admin')
      const [sch, rep, team, mon] = await Promise.all([
        fetch('/api/work/schedules?scope=mine', { headers: authHeaders() }).then((r) => r.json()),
        fetch('/api/work/daily-reports?scope=mine', { headers: authHeaders() }).then((r) => r.json()),
        fetch('/api/work/daily-reports?scope=all', { headers: authHeaders() }).then((r) => r.json()),
        fetch(`/api/work/monthly-reports?month=${month}`, { headers: authHeaders() }).then((r) => r.json()),
      ])
      setSchedules(sch.schedules || []); setGroups(sch.groups || {})
      setReports(rep.reports || []); setTeamReports(team.reports || [])
      setMonthly(mon)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fetch(`/api/work/monthly-reports?month=${month}`, { headers: authHeaders() }).then((r) => r.json()).then(setMonthly).catch(() => {}) }, [month])

  const createTask = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/work/schedules', { method: 'POST', headers: authHeaders(), body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowTask(false); setForm({}); load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setSaving(false) }
  }

  const taskAction = async (id: string, action: string) => {
    const extra = action === 'progress' ? { progress_notes: prompt('Progress note:') || '' } : action === 'issue' ? { issue: prompt('Describe the issue:') || '' } : {}
    if ((action === 'progress' || action === 'issue') && !extra) return
    const res = await fetch(`/api/work/schedules/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action, ...extra }) })
    const data = await res.json()
    if (!res.ok) setError(data.error)
    else load()
  }

  const openToday = async () => {
    const res = await fetch('/api/work/daily-reports', { method: 'POST', headers: authHeaders(), body: JSON.stringify({}) })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return }
    setOpenReport(data); load()
  }

  const openExisting = async (id: string) => {
    const res = await fetch(`/api/work/daily-reports/${id}`, { headers: authHeaders() })
    const data = await res.json()
    if (res.ok) setOpenReport(data)
  }

  const reportAction = async (id: string, action: string, payload: Record<string, string> = {}) => {
    const res = await fetch(`/api/work/daily-reports/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ action, ...payload }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return }
    if (action === 'add_item') { setNewItem({}); openExisting(id) }
    else if (openReport && String((openReport.report as Record<string, unknown>).id) === id) openExisting(id)
    load()
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>

  return (
    <div>
      <PageHeader
        eyebrow="Operations · Work"
        title="Schedule & Reporting"
        description="My schedule, daily work reports with auto-collected activities, manager review and monthly management reports."
        actions={<><Button variant="outline" onClick={() => downloadExport('schedules').catch((e) => setError(e instanceof Error ? e.message : 'Export failed'))}><Download className="w-4 h-4 mr-2" />Export</Button><Button onClick={() => { setForm({}); setShowTask(true) }} className="bg-accent-primary text-white"><Plus className="w-4 h-4 mr-2" />New Task</Button></>}
      />
      {error && <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red mb-4 text-sm">{error}</div>}

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['schedule', 'daily', 'monthly', 'team'] as const).map((t) => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)} className="capitalize">{t === 'daily' ? 'Daily Reports' : t === 'monthly' ? 'Monthly Report' : t === 'team' ? 'Team Review' : 'My Schedule'}</Button>
        ))}
      </div>

      {tab === 'schedule' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[['Today', (groups.today || []).length], ['Upcoming', (groups.upcoming || []).length], ['Overdue', (groups.overdue || []).length], ['Completed', (groups.completed || []).length]].map(([l, v]) => (
              <div key={String(l)} className="bg-white rounded-xl border border-border-subtle p-3"><p className="text-[11px] text-text-secondary">{l}</p><p className="text-lg font-bold font-mono">{String(v)}</p></div>
            ))}
          </div>
          <div className="space-y-2">
            {schedules.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-border-subtle p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div><p className="font-medium">{s.task_title}</p><p className="text-xs text-text-muted">Due {String(s.due_date || '—').slice(0, 10)} · {s.related_module} · <Badge>{s.status}</Badge> <Badge>{s.priority}</Badge></p></div>
                <div className="flex gap-1 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => taskAction(s.id, 'start')}>Start</Button>
                  <Button size="sm" variant="outline" onClick={() => taskAction(s.id, 'progress')}>Note</Button>
                  <Button size="sm" onClick={() => taskAction(s.id, 'complete')}>Complete</Button>
                  <Button size="sm" variant="outline" onClick={() => taskAction(s.id, 'issue')}>Issue</Button>
                </div>
              </div>
            ))}
            {schedules.length === 0 && <p className="text-sm text-text-muted">No tasks yet. Line managers assign work here.</p>}
          </div>
        </>
      )}

      {tab === 'daily' && (
        <>
          <Button className="mb-4 bg-accent-primary text-white" onClick={openToday}><FileText className="w-4 h-4 mr-2" />Open today's report (auto-collect)</Button>
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-border-subtle p-4 flex items-center justify-between">
                <div><p className="font-medium">{String(r.report_date).slice(0, 10)} · {r.employee_name}</p><p className="text-xs text-text-muted">{r.item_count || 0} activities · <Badge>{r.status}</Badge></p></div>
                <Button size="sm" variant="outline" onClick={() => openExisting(r.id)}>Open</Button>
              </div>
            ))}
            {reports.length === 0 && <p className="text-sm text-text-muted">No reports yet. Open today's report — system activities are pulled in automatically.</p>}
          </div>
        </>
      )}

      {tab === 'monthly' && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center"><Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-[200px]" />
            <Button variant="outline" onClick={async () => { const r = await fetch('/api/work/monthly-reports', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ month }) }).then((x) => x.json()); if (r.report) load() }}>Compile / refresh</Button>
          </div>
          {monthly && (
            <div className="bg-white rounded-xl border border-border-subtle p-5 space-y-3">
              <div className="flex items-center justify-between"><h3 className="font-bold">Monthly Management Report — {month}</h3><Badge>{String((monthly.saved as Record<string, unknown>)?.status || 'not saved')}</Badge></div>
              {(['inventory', 'documents', 'work'] as const).map((k) => (
                <div key={k} className="bg-bg-surface rounded-lg p-3"><p className="text-xs font-bold uppercase text-text-muted mb-1">{k}</p><pre className="text-xs font-mono whitespace-pre-wrap">{JSON.stringify((monthly.live as Record<string, unknown>)[k], null, 2)}</pre></div>
              ))}
              <p className="text-xs text-text-muted">Compiled from actual daily reports, stock movements, receipts and schedules — never invented. Management approval stays human.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'team' && (
        <div className="space-y-2">
          {!isAdmin && <p className="text-xs text-text-muted">Manager view: admins see all submitted reports here for review.</p>}
          {teamReports.filter((r) => r.status === 'submitted').map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-border-subtle p-4 flex items-center justify-between">
              <div><p className="font-medium">{String(r.report_date).slice(0, 10)} · {r.employee_name}</p><p className="text-xs text-text-muted"><Badge>{r.status}</Badge></p></div>
              <div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => openExisting(r.id)}>Review</Button><Button size="sm" onClick={() => reportAction(r.id, 'approve')}>Approve</Button><Button size="sm" variant="outline" onClick={() => { const c = prompt('Return reason (required):'); if (c) reportAction(r.id, 'return', { comment: c }) }}>Return</Button></div>
            </div>
          ))}
          {teamReports.filter((r) => r.status === 'submitted').length === 0 && <p className="text-sm text-text-muted">Nothing awaiting review.</p>}
        </div>
      )}

      {showTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTask(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Assign work</h3>
            {[['task_title', 'Task*'], ['description', 'Description'], ['assigned_to_name', 'Employee name'], ['due_date', 'Due date (YYYY-MM-DD)'], ['department', 'Department'], ['related_project', 'Project']].map(([k, label]) => (
              <div key={k}><label className="text-xs text-text-secondary">{label}</label><Input value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-text-secondary">Priority</label><Select value={form.priority || 'medium'} onValueChange={(v) => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['low', 'medium', 'high', 'urgent'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-xs text-text-secondary">Module</label><Select value={form.related_module || 'other'} onValueChange={(v) => setForm({ ...form, related_module: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['inventory', 'purchasing', 'sales', 'receipts', 'ict', 'marketing', 'service', 'admin', 'other'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowTask(false)}>Cancel</Button><Button disabled={saving} onClick={createTask} className="bg-accent-primary text-white">{saving ? 'Saving...' : 'Assign'}</Button></div>
          </div>
        </div>
      )}

      {openReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpenReport(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between"><div><h3 className="font-bold text-lg">Daily report — {String((openReport.report as Record<string, unknown>).report_date).slice(0, 10)}</h3><p className="text-sm text-text-secondary"><Badge>{String((openReport.report as Record<string, unknown>).status)}</Badge></p></div><Button variant="outline" onClick={() => setOpenReport(null)}>Close</Button></div>
            <div className="bg-bg-surface rounded-lg p-3"><h4 className="text-xs font-bold uppercase text-text-muted mb-2">Activities ({openReport.items.length}) — auto-collected + manual</h4>
              <div className="space-y-1 max-h-56 overflow-y-auto">{openReport.items.map((it, i) => (<p key={i} className="text-xs font-mono">[{String(it.source) === 'auto' ? 'auto' : 'manual'}] {String(it.activity_time || '')} {String(it.activity)} — {String(it.module)} · {String(it.status)}</p>))}{openReport.items.length === 0 && <p className="text-xs text-text-muted">No activities yet.</p>}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                <Input placeholder="Time (e.g. 14:30)" value={newItem.activity_time || ''} onChange={(e) => setNewItem({ ...newItem, activity_time: e.target.value })} />
                <Input placeholder="Activity*" value={newItem.activity || ''} onChange={(e) => setNewItem({ ...newItem, activity: e.target.value })} />
                <Input placeholder="Module" value={newItem.module || ''} onChange={(e) => setNewItem({ ...newItem, module: e.target.value })} />
                <Button size="sm" onClick={() => reportAction(String((openReport.report as Record<string, unknown>).id), 'add_item', { ...newItem, module: newItem.module || 'other' })}>Add</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[['summary', 'Summary'], ['challenges', 'Challenges'], ['actions_taken', 'Actions taken'], ['achievements', 'Achievements'], ['next_day_plan', 'Next-day plan']].map(([k, label]) => (
                <div key={k}><label className="text-xs text-text-secondary">{label}</label><Textarea value={String((openReport.report as Record<string, unknown>)[k] || '')} onChange={(e) => setOpenReport({ ...openReport, report: { ...(openReport.report as Record<string, unknown>), [k]: e.target.value } })} rows={2} /></div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => reportAction(String((openReport.report as Record<string, unknown>).id), 'save', { summary: String((openReport.report as Record<string, unknown>).summary || ''), challenges: String((openReport.report as Record<string, unknown>).challenges || ''), actions_taken: String((openReport.report as Record<string, unknown>).actions_taken || ''), achievements: String((openReport.report as Record<string, unknown>).achievements || ''), next_day_plan: String((openReport.report as Record<string, unknown>).next_day_plan || '') })}>Save draft</Button>
              <Button size="sm" onClick={() => reportAction(String((openReport.report as Record<string, unknown>).id), 'submit')}>Submit report</Button>
              {isAdmin && <><Button size="sm" variant="outline" onClick={() => reportAction(String((openReport.report as Record<string, unknown>).id), 'approve')}>Approve</Button><Button size="sm" variant="outline" onClick={() => { const c = prompt('Return reason:'); if (c) reportAction(String((openReport.report as Record<string, unknown>).id), 'return', { comment: c }) }}>Return</Button></>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
