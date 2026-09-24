'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Cloud, FolderOpen, Upload, X, Check, Loader2, FileText, Image as ImageIcon, Video, Archive, File as FileIcon } from 'lucide-react'

export interface PickedFile {
  id: string; name: string; mime_type: string; size_bytes: number
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}` }
}

function iconFor(mime: string) {
  const m = (mime || '').toLowerCase()
  if (m.startsWith('image/')) return ImageIcon
  if (m.startsWith('video/')) return Video
  if (m.includes('pdf') || m.includes('word') || m.includes('sheet') || m.includes('excel') || m === 'text/csv' || m === 'text/plain') return FileText
  if (m.includes('zip') || m.includes('rar')) return Archive
  return FileIcon
}

// Reusable Cloud Drive picker: browse folders, upload new, multi-select.
// Use anywhere business records need attachments (receipts, reports, GRNs...).
export function CloudFilePicker({ open, onClose, onSelect, multiple = true }: {
  open: boolean
  onClose: () => void
  onSelect: (files: PickedFile[]) => void
  multiple?: boolean
}) {
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([])
  const [files, setFiles] = useState<PickedFile[]>([])
  const [folderId, setFolderId] = useState('root')
  const [crumbs, setCrumbs] = useState<Array<{ id: string; name: string }>>([])
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [q, setQ] = useState('')

  const load = async (fid: string) => {
    setLoading(true)
    try {
      const h = authHeaders()
      const [fr, fl] = await Promise.all([
        fetch(`/api/drive/folders?parent=${fid}`, { headers: h }).then((r) => r.json()),
        fetch(`/api/drive/files?folder=${fid}&limit=200`, { headers: h }).then((r) => r.json()),
      ])
      setFolders(fr.folders || [])
      setFiles(fl.files || [])
      if (fid !== 'root') {
        const all = await fetch('/api/drive/folders?parent=all', { headers: h }).then((r) => r.json())
        const byId = new Map(((all.folders || []) as Array<{ id: string; name: string; parent_id: string | null }>).map((f) => [f.id, f]))
        const chain: Array<{ id: string; name: string }> = []
        let cur = byId.get(fid)
        while (cur) { chain.unshift({ id: cur.id, name: cur.name }); cur = cur.parent_id ? byId.get(cur.parent_id) : undefined }
        setCrumbs(chain)
      } else {
        setCrumbs([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setFolderId('root'); setChecked(new Set()); setQ('')
      load('root')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ])

  const nav = (fid: string) => { setFolderId(fid); load(fid) }

  const upload = async (list: FileList | null) => {
    if (!list || !list.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      Array.from(list).forEach((f) => fd.append('files', f))
      if (folderId !== 'root') fd.append('folder_id', folderId)
      fd.append('on_duplicate', 'keep_both')
      const token = localStorage.getItem('accessToken') || ''
      await fetch('/api/drive/files', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      load(folderId)
    } finally {
      setUploading(false)
    }
  }

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (!multiple) { next.clear(); next.add(id); return next }
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const confirm = () => {
    onSelect(files.filter((f) => checked.has(f.id)))
    onClose()
  }

  const shown = q ? files.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())) : files

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg-base rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 p-4 border-b border-border-subtle">
          <Cloud className="w-5 h-5 text-accent-primary-glow" />
          <p className="font-bold text-text-primary flex-1">Select from Cloud Drive</p>
          <label className="text-xs font-semibold text-accent-primary-glow cursor-pointer hover:underline flex items-center gap-1">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload new
            <input type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
          </label>
          <button onClick={onClose}><X className="w-5 h-5 text-text-muted" /></button>
        </div>
        <div className="p-3 border-b border-border-subtle flex items-center gap-2">
          <button onClick={() => nav('root')} className="text-xs text-accent-primary-glow hover:underline">My Drive</button>
          {crumbs.map((c) => (
            <span key={c.id} className="text-xs text-text-secondary">/ <button onClick={() => nav(c.id)} className="hover:text-text-primary">{c.name}</button></span>
          ))}
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter files..." className="ml-auto max-w-[180px] !py-1.5 !text-xs" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-accent-primary" /></div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {folders.map((f) => (
                  <button key={f.id} onClick={() => nav(f.id)} className="flex items-center gap-2 bg-bg-surface border border-border-subtle rounded-lg p-2.5 text-left hover:border-border-hover">
                    <FolderOpen className="w-5 h-5 text-accent-gold flex-shrink-0" />
                    <span className="text-xs text-text-primary truncate">{f.name}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                {shown.map((f) => {
                  const Icon = iconFor(f.mime_type)
                  const on = checked.has(f.id)
                  return (
                    <button key={f.id} onClick={() => toggle(f.id)} className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left border ${on ? 'border-accent-primary bg-accent-primary/10' : 'border-transparent hover:bg-bg-surface'}`}>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${on ? 'bg-accent-primary border-accent-primary' : 'border-border-default'}`}>
                        {on && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <Icon className="w-4 h-4 text-accent-primary-glow flex-shrink-0" />
                      <span className="text-sm text-text-primary truncate flex-1">{f.name}</span>
                    </button>
                  )
                })}
                {shown.length === 0 && <p className="text-xs text-text-muted text-center py-6">No files here. Upload new ones or open a folder.</p>}
              </div>
            </>
          )}
        </div>
        <div className="p-3 border-t border-border-subtle flex items-center gap-2">
          <p className="text-xs text-text-muted flex-1">{checked.size} selected</p>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={checked.size === 0} onClick={confirm} className="bg-accent-primary text-white">Attach selected</Button>
        </div>
      </div>
    </div>
  )
}
