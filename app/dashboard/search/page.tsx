'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search } from 'lucide-react'
import { RecordDrawer } from '@/components/operations/RecordDrawer'

interface Hit {
  group: string
  id: string
  title: string
  subtitle: string
  href: string
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}` }
}

const GROUP_ENTITY: Record<string, string> = {
  Products: 'product',
  'Purchase Orders': 'purchase_order',
  'Goods Receipts': 'goods_receipt',
  Receipts: 'receipt',
  Tasks: 'work_schedule',
  'Daily Reports': 'daily_report',
  Files: 'cloud_file',
}

export default function SearchPage() {
  const params = useSearchParams()
  const initial = params.get('q') || ''
  const [q, setQ] = useState(initial)
  const [hits, setHits] = useState<Hit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [drawer, setDrawer] = useState<{ entityType: string; entityId: string } | null>(null)

  const run = async (query: string) => {
    if (query.trim().length < 2) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Search failed')
      setHits(data.results || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initial.trim().length >= 2) run(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial])

  return (
    <div>
      <PageHeader
        eyebrow="Business Operating System"
        title="Universal Search"
        description="One query across products, suppliers, POs, GRNs, receipts, tasks, reports, files and leads — every record opens its connected 360° view."
      />
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run(q)} placeholder="Try GRN-2026, RC-2026, supplier name, product..." className="pl-10" />
        </div>
        <Button onClick={() => run(q)} className="bg-accent-primary text-white">Search</Button>
      </div>
      {error && <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red mb-4 text-sm">{error}</div>}
      {loading && <div className="flex items-center gap-2 text-text-secondary text-sm"><Loader2 className="w-4 h-4 animate-spin" />Searching the business graph...</div>}
      {!loading && hits.length === 0 && initial && <p className="text-sm text-text-muted">No matches. Try a PO number, GRN number, receipt code, supplier, product or employee name.</p>}
      <div className="space-y-2">
        {hits.map((h, i) => {
          const entityType = GROUP_ENTITY[h.group]
          return (
            <div key={`${h.group}-${h.id}-${i}`} className="bg-white rounded-xl border border-border-subtle p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1"><Badge>{h.group}</Badge></div>
                <p className="font-medium truncate">{h.title}</p>
                {h.subtitle && <p className="text-xs text-text-muted truncate">{h.subtitle}</p>}
              </div>
              {entityType ? (
                <Button size="sm" variant="outline" onClick={() => setDrawer({ entityType, entityId: h.id })}>Open 360°</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => { window.location.href = h.href }}>Open</Button>
              )}
            </div>
          )
        })}
      </div>
      {drawer && (
        <RecordDrawer
          entityType={drawer.entityType}
          entityId={drawer.entityId}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  )
}
