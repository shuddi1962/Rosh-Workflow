'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip, Download, X, Plus, Loader2, FileText } from 'lucide-react'
import { CloudFilePicker, type PickedFile } from './CloudFilePicker'

function authHeaders(extra: Record<string, string> = {}): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extra }
}

// Attachments block for any business record (receipts, reports, GRNs,
// schedules...). Files live once in Cloud Drive; links relate them here.
export function RecordAttachments({ entityType, entityId, compact = false }: {
  entityType: string
  entityId: string
  compact?: boolean
}) {
  const [files, setFiles] = useState<Array<PickedFile & { link_id?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [picker, setPicker] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/drive/links?entity_type=${encodeURIComponent(entityType)}&entity_id=${encodeURIComponent(entityId)}`, { headers: authHeaders() })
      const d = await r.json()
      setFiles(d.files || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [entityType, entityId])

  const attach = async (picked: PickedFile[]) => {
    setBusy(true)
    try {
      for (const f of picked) {
        await fetch('/api/drive/links', {
          method: 'POST', headers: authHeaders(),
          body: JSON.stringify({ file_id: f.id, entity_type: entityType, entity_id: entityId }),
        })
      }
      load()
    } finally {
      setBusy(false)
    }
  }

  const detach = async (linkId: string) => {
    await fetch(`/api/drive/links?link_id=${linkId}`, { method: 'DELETE', headers: authHeaders() })
    load()
  }

  const download = async (id: string, name: string) => {
    const r = await fetch(`/api/drive/files/${id}`, { headers: authHeaders() })
    const d = await r.json()
    if (d.downloadUrl) {
      const a = document.createElement('a')
      a.href = d.downloadUrl
      a.download = name
      a.target = '_blank'
      a.click()
    }
  }

  return (
    <div className={compact ? '' : 'bg-bg-surface border border-border-subtle rounded-xl p-4'}>
      <div className="flex items-center gap-2 mb-2">
        <Paperclip className="w-4 h-4 text-text-muted" />
        <p className="text-sm font-bold text-text-primary">Documents {files.length > 0 && <span className="text-text-muted font-normal">({files.length})</span>}</p>
        <Button size="sm" variant="outline" onClick={() => setPicker(true)} disabled={busy} className="ml-auto">
          <Plus className="w-3.5 h-3.5 mr-1" /> Attach from Drive
        </Button>
      </div>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
      ) : files.length === 0 ? (
        <p className="text-xs text-text-muted">No documents attached. Files stay in Cloud Drive — no duplicates.</p>
      ) : (
        <div className="space-y-1.5">
          {files.map((f) => (
            <div key={f.link_id || f.id} className="flex items-center gap-2 bg-bg-base border border-border-ghost rounded-lg px-2.5 py-1.5 text-sm">
              <FileText className="w-4 h-4 text-accent-primary-glow flex-shrink-0" />
              <span className="text-text-primary truncate flex-1">{f.name}</span>
              <button onClick={() => download(f.id, f.name)} className="text-text-muted hover:text-text-primary" title="Download"><Download className="w-3.5 h-3.5" /></button>
              <button onClick={() => f.link_id && detach(f.link_id)} className="text-text-muted hover:text-accent-red" title="Detach"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}
      <CloudFilePicker open={picker} onClose={() => setPicker(false)} onSelect={attach} />
    </div>
  )
}
