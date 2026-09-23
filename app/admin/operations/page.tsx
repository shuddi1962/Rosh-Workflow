'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Package, Receipt, CalendarCheck, ArrowRight } from 'lucide-react'
import { naira } from '@/lib/operations/types'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}` }
}

// Admin oversight of the operations module: live inventory, custody and
// reporting figures across the workspace, with shortcuts into the detail pages.
export default function AdminOperationsPage() {
  const router = useRouter()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [monthly, setMonthly] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/operations/overview', { headers: authHeaders() }).then((r) => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])
  useEffect(() => {
    fetch(`/api/work/monthly-reports?month=${month}`, { headers: authHeaders() }).then((r) => r.json()).then(setMonthly).catch(() => {})
  }, [month])

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>

  const inv = (data?.inventory as Record<string, number>) || {}
  const doc = (data?.documents as Record<string, number>) || {}
  const work = (data?.work as Record<string, unknown>) || {}

  return (
    <div>
      <h1 className="font-clash text-3xl font-bold text-text-primary mb-1">Operations Oversight</h1>
      <p className="text-text-secondary text-sm mb-6">Inventory, receipt custody and staff reporting across the workspace — all figures from live records.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Package, title: 'Inventory', rows: [['SKUs', String(inv.total_skus || 0)], ['Stock value', naira(Number(inv.stock_value_cost || 0))], ['Low stock', String(inv.low_stock || 0)]], href: '/dashboard/inventory' },
          { icon: Receipt, title: 'Receipt custody', rows: [['Pending submission', String(doc.pending_submission || 0)], ['Awaiting verification', String(doc.awaiting_verification || 0)]], href: '/dashboard/documents' },
          { icon: CalendarCheck, title: 'Reporting', rows: [['Reports awaiting review', String(work.team_pending_reports || 0)], ['Overdue tasks', String(work.overdue_tasks || 0)]], href: '/dashboard/work' },
        ].map((c) => (
          <button key={c.title} onClick={() => router.push(c.href)} className="text-left bg-white rounded-xl border border-border-subtle p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><c.icon className="w-5 h-5 text-accent-primary" /><h3 className="font-bold">{c.title}</h3></div><ArrowRight className="w-4 h-4 text-text-muted" /></div>
            {c.rows.map(([k, v]) => <div key={k} className="flex justify-between py-1 text-sm"><span className="text-text-secondary">{k}</span><span className="font-mono font-bold">{v}</span></div>)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-5">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-bold">Monthly management report —</h3>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border border-border-subtle rounded-lg px-2 py-1 text-sm" />
          <button onClick={() => router.push('/dashboard/work')} className="ml-auto text-sm text-accent-primary font-semibold">Open in workspace →</button>
        </div>
        {monthly && <pre className="text-xs font-mono whitespace-pre-wrap bg-bg-surface rounded-lg p-3 max-h-96 overflow-y-auto">{JSON.stringify((monthly.live || monthly), null, 2).slice(0, 6000)}</pre>}
      </div>
    </div>
  )
}
