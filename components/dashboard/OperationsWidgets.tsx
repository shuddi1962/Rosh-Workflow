'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Receipt, CalendarCheck } from 'lucide-react'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}` }
}

// Clickable operational widgets for the main dashboard (real DB figures only).
export function OperationsWidgets() {
  const router = useRouter()
  const [data, setData] = useState<{ inventory: Record<string, number>; documents: Record<string, number>; work: Record<string, unknown> } | null>(null)

  useEffect(() => {
    fetch('/api/operations/overview', { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setData({ inventory: d.inventory, documents: d.documents, work: d.work }) })
      .catch(() => {})
  }, [])

  const widgets = [
    { icon: Package, label: 'Stock value', value: data ? `₦${Number(data.inventory.stock_value_cost || 0).toLocaleString()}` : '…', sub: data ? `${data.inventory.low_stock || 0} low stock · ${data.inventory.movements_today || 0} moves today` : 'loading…', href: '/dashboard/inventory' },
    { icon: Receipt, label: 'Receipts with me', value: data ? String(data.documents.with_me ?? '…') : '…', sub: data ? `${data.documents.pending_submission || 0} pending · ${data.documents.awaiting_verification || 0} awaiting review` : 'loading…', href: '/dashboard/documents' },
    { icon: CalendarCheck, label: 'Today tasks', value: data ? String(data.work.today_tasks ?? '…') : '…', sub: data ? `report: ${String(data.work.daily_report_status || '—')}` : 'loading…', href: '/dashboard/work' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {widgets.map((w) => (
        <button key={w.label} onClick={() => router.push(w.href)} className="text-left bg-white rounded-xl border border-border-subtle p-4 hover:shadow-md hover:border-border-default transition">
          <div className="flex items-center gap-2 mb-1"><w.icon className="w-4 h-4 text-accent-primary" /><span className="text-xs text-text-secondary">{w.label}</span></div>
          <p className="text-xl font-bold font-mono text-text-primary">{w.value}</p>
          <p className="text-xs text-text-muted mt-1">{w.sub}</p>
        </button>
      ))}
    </div>
  )
}
