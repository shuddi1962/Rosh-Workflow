'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, X, Link2 } from 'lucide-react'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

interface Props {
  entityType: string
  entityId: string
  onClose: () => void
}

/**
 * RecordDrawer — the reusable Universal Record Drawer.
 * Overview + Timeline + Links + Documents + Approvals + Activity
 * for ANY business object (PO, GRN, receipt, task, report, product...).
 */
export function RecordDrawer({ entityType, entityId, onClose }: Props) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'overview' | 'timeline' | 'links' | 'approvals'>('overview')

  useEffect(() => {
    fetch(`/api/records/timeline?entity_type=${entityType}&entity_id=${entityId}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false))
  }, [entityType, entityId])

  const record = (data?.record as Record<string, unknown>) || {}
  const timeline = ((data?.timeline as Array<Record<string, unknown>>) || [])
  const links = ((data?.links as Array<Record<string, unknown>>) || [])
  const approvals = ((data?.approvals as Array<Record<string, unknown>>) || [])
  const ref =
    String(record.po_number || record.grn_number || record.receipt_code || record.task_title || record.name || record.title || entityId).slice(0, 80)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white w-full max-w-xl h-full overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase text-text-muted font-bold">{entityType.replace(/_/g, ' ')}</p>
            <h3 className="font-bold text-lg">{ref}</h3>
          </div>
          <Button size="sm" variant="outline" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="flex gap-2">
          {(['overview', 'timeline', 'links', 'approvals'] as const).map((t) => (
            <Button key={t} size="sm" variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)} className="capitalize">{t}</Button>
          ))}
        </div>

        {loading && <div className="flex items-center gap-2 text-sm text-text-secondary"><Loader2 className="w-4 h-4 animate-spin" />Loading connected record...</div>}
        {error && <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red text-sm">{error}</div>}

        {!loading && !error && tab === 'overview' && (
          <div className="bg-bg-surface rounded-lg p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">{JSON.stringify(record, null, 2)}</pre>
          </div>
        )}

        {!loading && !error && tab === 'timeline' && (
          <div className="space-y-0">
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-primary mt-1.5" />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-border-subtle" />}
                </div>
                <div className="pb-4">
                  <p className="text-xs text-text-muted font-mono">{String(t.at).slice(0, 16).replace('T', ' ')} · {String(t.kind)}</p>
                  <p className="text-sm font-medium">{String(t.title)}</p>
                  {String(t.detail || '').length > 0 && <p className="text-xs text-text-secondary">{String(t.detail || '').slice(0, 220)}</p>}
                </div>
              </div>
            ))}
            {timeline.length === 0 && <p className="text-sm text-text-muted">No activity yet — events will appear here as work happens.</p>}
          </div>
        )}

        {!loading && !error && tab === 'links' && (
          <div className="space-y-2">
            {links.map((l, i) => (
              <div key={i} className="flex items-center gap-2 text-sm bg-bg-surface rounded-lg p-2">
                <Link2 className="w-3.5 h-3.5 text-text-muted" />
                <span className="font-mono text-xs">{String(l.source_type)} → {String(l.target_type)} · {String(l.link_type)}</span>
              </div>
            ))}
            {links.length === 0 && <p className="text-sm text-text-muted">No linked records yet. GRNs link to POs, movements, receipts and suppliers automatically.</p>}
          </div>
        )}

        {!loading && !error && tab === 'approvals' && (
          <div className="space-y-2">
            {approvals.map((a, i) => (
              <div key={i} className="bg-bg-surface rounded-lg p-2 text-sm">
                <div className="flex items-center gap-2"><Badge>{String(a.status)}</Badge><span className="text-xs text-text-muted">{String(a.action)} · {String(a.created_at).slice(0, 10)}</span></div>
                <p className="text-xs mt-1">Requested by {String(a.requested_by_name)} {a.decided_by_name ? `· decided by ${String(a.decided_by_name)} (${String(a.decision)})` : '· awaiting decision'}</p>
              </div>
            ))}
            {approvals.length === 0 && <p className="text-sm text-text-muted">No approvals for this record.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
