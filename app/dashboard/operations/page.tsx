'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Loader2, Package, Receipt, CalendarCheck, Bell, ArrowRight } from 'lucide-react'
import { naira } from '@/lib/operations/types'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}` }
}

export default function OperationsOverviewPage() {
  const router = useRouter()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/operations/overview', { headers: authHeaders() })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>

  const inv = (data?.inventory as Record<string, number>) || {}
  const doc = (data?.documents as Record<string, number>) || {}
  const work = (data?.work as Record<string, unknown>) || {}
  const events = ((data?.recent_events as Array<Record<string, unknown>>) || [])

  const cards: Array<{ title: string; href: string; icon: typeof Package; rows: Array<[string, string]> }> = [
    { icon: Package, title: 'Inventory', rows: [[ 'SKUs', String(inv.total_skus || 0) ], ['Stock value', naira(Number((data?.inventory as Record<string, number>)?.stock_value_cost || 0))], ['Low stock', String(inv.low_stock || 0)], ['Movements today', String(inv.movements_today || 0)]], href: '/dashboard/inventory' },
    { icon: Receipt, title: 'Documents', rows: [['With me', String(doc.with_me || 0)], ['Pending submission', String(doc.pending_submission || 0)], ['Awaiting verification', String(doc.awaiting_verification || 0)]], href: '/dashboard/documents' },
    { icon: CalendarCheck, title: 'Work', rows: [['Today tasks', String(work.today_tasks || 0)], ['Overdue', String(work.overdue_tasks || 0)], ['Daily report', String(work.daily_report_status || '—')]], href: '/dashboard/work' },
  ]

  return (
    <div>
      <PageHeader eyebrow="Operations" title="Operations Overview" description="Inventory, receipt custody and staff reporting — live figures from the database." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {cards.map((c) => (
          <button key={c.title} onClick={() => router.push(c.href)} className="text-left bg-white rounded-xl border border-border-subtle p-5 hover:border-border-default hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><c.icon className="w-5 h-5 text-accent-primary" /><h3 className="font-bold">{c.title}</h3></div><ArrowRight className="w-4 h-4 text-text-muted" /></div>
            {c.rows.map(([k, v]) => (
              <div key={String(k)} className="flex items-center justify-between py-1 text-sm"><span className="text-text-secondary">{k}</span><span className="font-mono font-bold">{String(v)}</span></div>
            ))}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-border-subtle p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Business activity — one connected stream</h3>
          <button onClick={() => router.push('/dashboard/search')} className="text-xs text-accent-primary font-medium">Universal search →</button>
        </div>
        {events.map((e, i) => (
          <p key={i} className="text-sm py-1 border-b border-border-ghost last:border-0"><span className="font-medium">{String(e.title)}</span> <span className="text-text-secondary">— {String(e.summary || '').slice(0, 120)}</span></p>
        ))}
        {events.length === 0 && <p className="text-sm text-text-muted">No business events yet. Goods receipts, stock moves, receipts and tasks will appear here automatically.</p>}
        {(Number(data?.approvals_pending || 0) > 0 || Number(data?.approvals_mine || 0) > 0) && (
          <p className="text-xs mt-2 text-text-secondary">{String(data?.approvals_pending || 0)} approvals pending · {String(data?.approvals_mine || 0)} assigned to you</p>
        )}
      </div>
      <div className="bg-white rounded-xl border border-border-subtle p-5">
        <div className="flex items-center gap-2 mb-3"><Bell className="w-4 h-4 text-accent-gold" /><h3 className="font-bold text-sm">Notifications ({Number(data?.unread_count || 0)} unread)</h3></div>
        {(((data?.notifications as unknown[]) || []) as Array<Record<string, unknown>>).map((n, i) => (
          <p key={i} className="text-sm py-1 border-b border-border-ghost last:border-0"><span className="font-medium">{String(n.title)}</span> <span className="text-text-secondary">— {String(n.message)}</span></p>
        ))}
        {((data?.notifications as unknown[]) || []).length === 0 && <p className="text-sm text-text-muted">No notifications. Reminders for reports, receipts and tasks appear here.</p>}
      </div>
    </div>
  )
}
