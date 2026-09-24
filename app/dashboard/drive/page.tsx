'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Cloud, FolderPlus, Upload, Search, Grid3X3, List, ChevronRight, Home,
  FileText, Image as ImageIcon, Video, Music, Archive, File as FileIcon,
  Star, Trash2, Download, Share2, Eye, MoreVertical, X, FolderOpen,
  Link2, Copy, RotateCcw, Clock, HardDrive, Check, Loader2, Camera,
  ChevronDown, AlertTriangle, CreditCard, History, Users, Lock, RefreshCw,
} from 'lucide-react'

interface DriveFile {
  id: string; business_id: string; folder_id: string | null; name: string
  mime_type: string; extension: string; size_bytes: number; version: number
  created_by_name: string; is_starred: boolean; trashed_at: string | null
  created_at: string; updated_at: string; last_opened_at?: string
  share_permission?: string; link_id?: string; auto_delete_at?: string
  tags?: string[]
}

interface DriveFolder {
  id: string; parent_id: string | null; name: string; is_starred: boolean
  trashed_at: string | null; created_at: string; updated_at: string
  share_permission?: string; auto_delete_at?: string
}

interface UploadJob {
  id: string; name: string; size: number; progress: number
  status: 'queued' | 'uploading' | 'done' | 'error' | 'cancelled'
  error?: string; duplicate?: boolean; xhr?: XMLHttpRequest | null; blob?: File | null
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''
  return { Authorization: `Bearer ${token}` }
}

function fmtBytes(n: number): string {
  if (!n || n <= 0) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)))
  const v = n / Math.pow(1024, i)
  return `${v >= 100 ? Math.round(v) : v.toFixed(1)} ${u[i]}`
}

function fmtDate(s?: string | null): string {
  if (!s) return '—'
  const d = new Date(s)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function iconFor(f: { mime_type: string; extension: string }) {
  const m = (f.mime_type || '').toLowerCase()
  const e = (f.extension || '').toLowerCase()
  if (m.startsWith('image/')) return ImageIcon
  if (m.startsWith('video/')) return Video
  if (m.startsWith('audio/')) return Music
  if (['zip', 'rar'].includes(e)) return Archive
  if (m.includes('pdf') || m.includes('word') || m.includes('sheet') || m.includes('excel') || m.includes('presentation') || m.includes('powerpoint') || m === 'text/csv' || m === 'text/plain') return FileText
  return FileIcon
}

const VIEWS = [
  { key: 'my-drive', label: 'My Drive' }, { key: 'shared', label: 'Shared with me' },
  { key: 'recent', label: 'Recent' }, { key: 'starred', label: 'Starred' },
  { key: 'trash', label: 'Trash' }, { key: 'storage', label: 'Storage' },
]

export default function CloudDrivePage() {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'my-drive'
  const folderParam = searchParams.get('folder') || 'root'
  const [folders, setFolders] = useState<DriveFolder[]>([])
  const [files, setFiles] = useState<DriveFile[]>([])
  const [total, setTotal] = useState(0)
  const [allFolders, setAllFolders] = useState<DriveFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sort, setSort] = useState('modified')
  const [grid, setGrid] = useState(true)
  const [selected, setSelected] = useState<DriveFile | null>(null)
  const [detail, setDetail] = useState<{ downloadUrl?: string; permission?: string; versions?: Array<Record<string, unknown>>; linked_to?: Array<Record<string, unknown>> } | null>(null)
  const [preview, setPreview] = useState<{ file: DriveFile; url: string; text?: string } | null>(null)
  const [menu, setMenu] = useState<{ x: number; y: number; file?: DriveFile; folder?: DriveFolder } | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [uploads, setUploads] = useState<UploadJob[]>([])
  const [showUploads, setShowUploads] = useState(false)
  const [renameTarget, setRenameTarget] = useState<{ kind: 'file' | 'folder'; id: string; name: string } | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [moveTarget, setMoveTarget] = useState<{ kind: 'file' | 'folder'; id: string; name: string } | null>(null)
  const [moveFolder, setMoveFolder] = useState('root')
  const [shareTarget, setShareTarget] = useState<{ kind: 'file' | 'folder'; id: string; name: string } | null>(null)
  const [shares, setShares] = useState<Array<Record<string, unknown>>>([])
  const [shareEmail, setShareEmail] = useState('')
  const [sharePerm, setSharePerm] = useState('viewer')
  const [links, setLinks] = useState<Array<Record<string, unknown>>>([])
  const [linkExpiry, setLinkExpiry] = useState('')
  const [linkPassword, setLinkPassword] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'file' | 'folder'; id: string; name: string; permanent?: boolean } | null>(null)
  const [storage, setStorage] = useState<Record<string, unknown> | null>(null)
  const [plans, setPlans] = useState<Array<Record<string, unknown>>>([])
  const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const cameraInput = useRef<HTMLInputElement>(null)
  const folderInput = useRef<HTMLInputElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const folderId = view === 'my-drive' ? folderParam : null

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const h = authHeaders()
      const allF = await fetch('/api/drive/folders?parent=all', { headers: h }).then((r) => r.json())
      setAllFolders((allF.folders || []) as DriveFolder[])
      if (view === 'my-drive') {
        const [fr, fl] = await Promise.all([
          fetch(`/api/drive/folders?parent=${folderId}`, { headers: h }).then((r) => r.json()),
          fetch(`/api/drive/files?folder=${folderId}&limit=500&sort=${sort}`, { headers: h }).then((r) => r.json()),
        ])
        setFolders(fr.folders || []); setFiles(fl.files || []); setTotal(fl.total || 0)
      } else if (view === 'shared') {
        const d = await fetch('/api/drive/shared', { headers: h }).then((r) => r.json())
        setFiles(d.shared_with_me || []); setFolders((d.shared_folders || []) as DriveFolder[]); setTotal((d.shared_with_me || []).length)
      } else if (view === 'recent') {
        const d = await fetch('/api/drive/recent?limit=100', { headers: h }).then((r) => r.json())
        setFiles(d.recent || []); setFolders([]); setTotal((d.recent || []).length)
      } else if (view === 'starred') {
        const d = await fetch('/api/drive/starred', { headers: h }).then((r) => r.json())
        setFiles(d.files || []); setFolders(d.folders || []); setTotal((d.files || []).length)
      } else if (view === 'trash') {
        const d = await fetch('/api/drive/trash', { headers: h }).then((r) => r.json())
        setFiles(d.files || []); setFolders(d.folders || []); setTotal((d.files || []).length)
      } else if (view === 'storage') {
        const [u, p] = await Promise.all([
          fetch('/api/drive/usage', { headers: h }).then((r) => r.json()),
          fetch('/api/storage/plans').then((r) => r.json()),
        ])
        setStorage(u); setPlans(p.plans || [])
        setFiles([]); setFolders([])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoading(false)
    }
  }, [view, folderId, sort])

  useEffect(() => { load() }, [load])

  // Server verify after payment redirect (?verify=ST-...)
  useEffect(() => {
    const ref = searchParams.get('verify')
    if (!ref || view !== 'storage') return
    setBusy(true)
    fetch('/api/storage/verify', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: ref }) })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        setNotice(ok ? 'Payment verified — storage plan activated.' : `Verification: ${d.error || 'pending'}`)
        load()
      })
      .catch(() => setNotice('Verification failed — try again.'))
      .finally(() => setBusy(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  const runSearch = (term: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      if (!term.trim()) { load(); return }
      setLoading(true)
      try {
        const d = await fetch(`/api/drive/search?q=${encodeURIComponent(term)}${typeFilter ? `&type=${typeFilter}` : ''}`, { headers: authHeaders() }).then((r) => r.json())
        setFiles(d.files || []); setFolders([]); setTotal(d.total || 0)
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  const crumbs = (() => {
    if (view !== 'my-drive' || !folderId || folderId === 'root') return []
    const byId = new Map(allFolders.map((f) => [f.id, f]))
    const chain: DriveFolder[] = []
    let cur = byId.get(folderId)
    while (cur) { chain.unshift(cur); cur = cur.parent_id ? byId.get(cur.parent_id) : undefined }
    return chain
  })()

  const go = (v: string, folder = 'root') => {
    window.location.href = folder === 'root' && v === 'my-drive' ? '/dashboard/drive' : `/dashboard/drive?view=${v}${v === 'my-drive' && folder !== 'root' ? `&folder=${folder}` : ''}`
  }

  // ---- uploads (XHR for real progress) ----
  const sendFile = (file: File, onDup: string, jobId?: string) => {
    const id = jobId || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    if (!jobId) {
      setUploads((prev) => [...prev, { id, name: file.name, size: file.size, progress: 0, status: 'queued', xhr: null, blob: file }])
    } else {
      setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: 0, status: 'uploading', error: undefined, duplicate: undefined } : u)))
    }
    const xhr = new XMLHttpRequest()
    const fd = new FormData()
    fd.append('files', file)
    if (folderId && folderId !== 'root') fd.append('folder_id', folderId)
    fd.append('on_duplicate', onDup)
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'uploading', xhr } : u)))
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: Math.round((e.loaded / e.total) * 100) } : u)))
    }
    xhr.onload = () => {
      try {
        const d = JSON.parse(xhr.responseText)
        const r = (d.results || [])[0] as { ok?: boolean; error?: string; duplicate?: boolean } | undefined
        if (xhr.status >= 200 && xhr.status < 300 && r?.ok) {
          setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: 100, status: 'done', xhr: null, blob: null } : u)))
          load()
        } else {
          setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'error', error: r?.error || d.error || 'Upload failed', duplicate: r?.duplicate, xhr: null } : u)))
        }
      } catch {
        setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'error', error: 'Upload failed', xhr: null } : u)))
      }
    }
    xhr.onerror = () => setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'error', error: 'Network error', xhr: null } : u)))
    xhr.open('POST', '/api/drive/files')
    const token = localStorage.getItem('accessToken') || ''
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(fd)
  }

  const startUpload = (list: FileList | File[], onDup = 'keep_both') => {
    const arr = Array.from(list)
    if (!arr.length) return
    setShowUploads(true)
    arr.forEach((file) => sendFile(file, onDup))
  }

  const retryUpload = (job: UploadJob, mode: string) => {
    if (!job.blob) {
      setNotice(`"${job.name}" can no longer be retried automatically — please upload it again with the Upload button.`)
      return
    }
    sendFile(job.blob, mode, job.id)
  }

  const cancelUpload = (job: UploadJob) => {
    job.xhr?.abort()
    setUploads((prev) => prev.map((u) => (u.id === job.id ? { ...u, status: 'cancelled', xhr: null } : u)))
  }

  // ---- actions ----
  const api = async (url: string, opts?: RequestInit) => {
    const r = await fetch(url, { ...opts, headers: { ...authHeaders(), 'Content-Type': 'application/json', ...(opts?.headers || {}) } })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Request failed')
    return d
  }

  const doDownload = async (f: DriveFile) => {
    try {
      const d = await api(`/api/drive/files/${f.id}?view=1`)
      const a = document.createElement('a')
      a.href = d.downloadUrl
      a.download = f.name
      a.target = '_blank'
      a.click()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed')
    }
  }

  const doPreview = async (f: DriveFile) => {
    try {
      const d = await api(`/api/drive/files/${f.id}?view=1`)
      const m = (f.mime_type || '').toLowerCase()
      if (m === 'text/plain' || m === 'text/csv' || f.extension === 'txt' || f.extension === 'csv') {
        const text = await fetch(d.downloadUrl).then((r) => r.text()).then((t) => t.slice(0, 20000))
        setPreview({ file: f, url: d.downloadUrl, text })
      } else {
        setPreview({ file: f, url: d.downloadUrl })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Preview failed')
    }
  }

  const openDetails = async (f: DriveFile) => {
    setSelected(f); setDetail(null)
    try {
      const d = await api(`/api/drive/files/${f.id}`)
      setDetail(d)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Details failed')
    }
  }

  const doRename = async () => {
    if (!renameTarget || !renameValue.trim()) return
    setBusy(true)
    try {
      const base = renameTarget.kind === 'file' ? `/api/drive/files/${renameTarget.id}` : `/api/drive/folders/${renameTarget.id}`
      await api(base, { method: 'PUT', body: JSON.stringify({ name: renameValue.trim() }) })
      setRenameTarget(null); load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Rename failed')
    } finally {
      setBusy(false)
    }
  }

  const doMove = async () => {
    if (!moveTarget) return
    setBusy(true)
    try {
      if (moveTarget.kind === 'file') {
        await api(`/api/drive/files/${moveTarget.id}`, { method: 'PUT', body: JSON.stringify({ folder_id: moveFolder === 'root' ? null : moveFolder }) })
      } else {
        await api(`/api/drive/folders/${moveTarget.id}`, { method: 'PUT', body: JSON.stringify({ parent_id: moveFolder === 'root' ? null : moveFolder }) })
      }
      setMoveTarget(null); load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Move failed')
    } finally {
      setBusy(false)
    }
  }

  const doDelete = async () => {
    if (!deleteTarget) return
    setBusy(true)
    try {
      const base = deleteTarget.kind === 'file' ? `/api/drive/files/${deleteTarget.id}` : `/api/drive/folders/${deleteTarget.id}`
      await api(deleteTarget.permanent ? `${base}?permanent=1` : base, { method: 'DELETE' })
      setDeleteTarget(null); setSelected(null); load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  const doRestore = async (f: DriveFile) => {
    try {
      await api(`/api/drive/files/${f.id}/restore`, { method: 'POST' })
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Restore failed')
    }
  }

  const doStar = async (kind: 'file' | 'folder', id: string, starred: boolean) => {
    const base = kind === 'file' ? `/api/drive/files/${id}` : `/api/drive/folders/${id}`
    await api(base, { method: 'PUT', body: JSON.stringify({ is_starred: !starred }) })
    load()
    if (selected && kind === 'file' && selected.id === id) setSelected({ ...selected, is_starred: !starred })
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return
    setCreatingFolder(true)
    try {
      await api('/api/drive/folders', { method: 'POST', body: JSON.stringify({ name: newFolderName.trim(), parent_id: folderId && folderId !== 'root' ? folderId : null }) })
      setNewFolderName(''); setShowNew(false); load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create folder failed')
    } finally {
      setCreatingFolder(false)
    }
  }

  const openShare = async (kind: 'file' | 'folder', id: string, name: string) => {
    setShareTarget({ kind, id, name }); setShares([]); setLinks([])
    try {
      const s = await api(kind === 'file' ? `/api/drive/files/${id}/shares` : `/api/drive/folders/${id}/shares`)
      setShares(s.shares || [])
      const l = await api('/api/drive/share-links')
      setLinks(((l.links || []) as Array<Record<string, unknown>>).filter((x) => String(x.file_id || '') === id || String(x.folder_id || '') === id))
    } catch { /* owner-only lists may 403 for non-owners */ }
  }

  const addShare = async () => {
    if (!shareTarget || !shareEmail.trim()) return
    setBusy(true)
    try {
      await api(shareTarget.kind === 'file' ? `/api/drive/files/${shareTarget.id}/shares` : `/api/drive/folders/${shareTarget.id}/shares`, {
        method: 'POST', body: JSON.stringify({ email: shareEmail.trim(), permission: sharePerm }),
      })
      setShareEmail(''); openShare(shareTarget.kind, shareTarget.id, shareTarget.name)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Share failed')
    } finally {
      setBusy(false)
    }
  }

  const revokeShare = async (shareId: string) => {
    if (!shareTarget) return
    await api(`${shareTarget.kind === 'file' ? `/api/drive/files/${shareTarget.id}/shares` : `/api/drive/folders/${shareTarget.id}/shares`}?share_id=${shareId}`, { method: 'DELETE' })
    openShare(shareTarget.kind, shareTarget.id, shareTarget.name)
  }

  const createLink = async () => {
    if (!shareTarget) return
    setBusy(true)
    try {
      const payload: Record<string, unknown> = { permission: 'viewer' }
      if (shareTarget.kind === 'file') payload.file_id = shareTarget.id
      else payload.folder_id = shareTarget.id
      if (linkExpiry) payload.expires_at = new Date(linkExpiry).toISOString()
      if (linkPassword) payload.password = linkPassword
      const d = await api('/api/drive/share-links', { method: 'POST', body: JSON.stringify(payload) })
      setNotice(`Link created: ${window.location.origin}/api${d.url}`)
      setLinkExpiry(''); setLinkPassword('')
      openShare(shareTarget.kind, shareTarget.id, shareTarget.name); load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Link failed')
    } finally {
      setBusy(false)
    }
  }

  const revokeLink = async (linkId: string) => {
    await api(`/api/drive/share-links?link_id=${linkId}`, { method: 'DELETE' })
    if (shareTarget) openShare(shareTarget.kind, shareTarget.id, shareTarget.name)
  }

  const checkout = async (planId: string, cycle: 'monthly' | 'annual') => {
    setBusy(true); setNotice('')
    try {
      const d = await api('/api/storage/checkout', { method: 'POST', body: JSON.stringify({ plan_id: planId, billing_cycle: cycle }) })
      if (d.authorization_url) window.location.href = d.authorization_url
      else setNotice(d.message || `Request recorded (${d.reference}). An administrator will activate it.`)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed')
    } finally {
      setBusy(false)
    }
  }

  const cancelSub = async () => {
    if (!confirm('Cancel the current storage subscription? It falls back to Free if usage fits.')) return
    setBusy(true)
    try {
      const d = await api('/api/storage/subscription/cancel', { method: 'POST' })
      setNotice(d.warning || 'Subscription cancelled.')
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancel failed')
    } finally {
      setBusy(false)
    }
  }

  const emptyTrash = async () => {
    if (!confirm('Permanently destroy everything in trash? This cannot be undone.')) return
    setBusy(true)
    try {
      const d = await api('/api/drive/trash/empty', { method: 'POST' })
      setNotice(`Trash emptied: ${d.destroyed} files destroyed.`)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Empty trash failed')
    } finally {
      setBusy(false)
    }
  }

  const flatFolders = (() => {
    const byParent = new Map<string, DriveFolder[]>()
    for (const f of allFolders.filter((x) => !x.trashed_at)) {
      const k = f.parent_id || 'root'
      if (!byParent.has(k)) byParent.set(k, [])
      byParent.get(k)?.push(f)
    }
    const out: Array<{ f: DriveFolder; depth: number }> = []
    const walk = (pid: string, depth: number) => {
      for (const f of (byParent.get(pid) || []).sort((a, b) => a.name.localeCompare(b.name))) {
        out.push({ f, depth })
        walk(f.id, depth + 1)
      }
    }
    walk('root', 0)
    return out
  })()

  const visibleFiles = typeFilter && !q
    ? files.filter((f) => {
        const m = (f.mime_type || '').toLowerCase()
        if (typeFilter === 'document') return m.includes('pdf') || m.includes('word') || m.includes('sheet') || m.includes('excel') || m.includes('presentation') || m === 'text/csv' || m === 'text/plain'
        if (typeFilter === 'image') return m.startsWith('image/')
        if (typeFilter === 'video') return m.startsWith('video/')
        if (typeFilter === 'archive') return ['zip', 'rar'].includes((f.extension || '').toLowerCase())
        return true
      })
    : files

  const activeUploads = uploads.filter((u) => u.status === 'uploading' || u.status === 'queued').length

  return (
    <div onClick={() => setMenu(null)}>
      <PageHeader
        eyebrow="Cloud Drive"
        title={VIEWS.find((v) => v.key === view)?.label || 'My Drive'}
        description="Everything your business needs, securely stored in one place."
      />

      {error && <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red mb-4 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}<button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button></div>}
      {notice && <div className="bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg p-3 text-accent-emerald mb-4 text-sm flex items-center gap-2"><Check className="w-4 h-4" />{notice}<button onClick={() => setNotice('')} className="ml-auto"><X className="w-4 h-4" /></button></div>}

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Button onClick={(e) => { e.stopPropagation(); setShowNew(!showNew) }} className="bg-accent-primary text-white">
            <FolderPlus className="w-4 h-4 mr-2" /> New <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
          {showNew && (
            <div className="absolute z-30 mt-2 w-56 bg-bg-elevated border border-border-default rounded-xl shadow-xl p-2" onClick={(e) => e.stopPropagation()}>
              <div className="px-3 py-2">
                <label className="text-xs text-text-secondary">New folder</label>
                <div className="flex gap-1 mt-1">
                  <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name" onKeyDown={(e) => e.key === 'Enter' && createFolder()} />
                  <Button size="sm" disabled={creatingFolder} onClick={createFolder}>{creatingFolder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}</Button>
                </div>
              </div>
              <button onClick={() => { fileInput.current?.click(); setShowNew(false) }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-surface text-sm text-text-primary flex items-center gap-2"><Upload className="w-4 h-4" /> Upload files</button>
              <button onClick={() => { folderInput.current?.click(); setShowNew(false) }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-surface text-sm text-text-primary flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Upload folder</button>
              <button onClick={() => { cameraInput.current?.click(); setShowNew(false) }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-bg-surface text-sm text-text-primary flex items-center gap-2"><Camera className="w-4 h-4" /> Scan / camera upload</button>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => fileInput.current?.click()}><Upload className="w-4 h-4 mr-2" /> Upload</Button>
        <input ref={fileInput} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) startUpload(e.target.files); e.target.value = '' }} />
        <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { if (e.target.files) startUpload(e.target.files); e.target.value = '' }} />
        <input ref={folderInput} type="file" multiple {...{ webkitdirectory: '' } as Record<string, string>} className="hidden" onChange={(e) => { if (e.target.files) startUpload(e.target.files); e.target.value = '' }} />
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); runSearch(e.target.value) }} placeholder="Search files, owners, tags..." className="pl-10" />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); if (q) runSearch(q); else load() }} className="px-3 py-2 rounded-lg border border-border-default bg-bg-base text-sm text-text-primary">
          <option value="">All types</option>
          <option value="document">Documents</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="archive">Archives</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 rounded-lg border border-border-default bg-bg-base text-sm text-text-primary">
          <option value="modified">Last modified</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
        </select>
        <Button variant="outline" size="sm" onClick={() => setGrid(!grid)}>{grid ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}</Button>
        <Button variant="outline" size="sm" onClick={() => setShowUploads(!showUploads)} className="relative">
          Uploads {activeUploads > 0 && <span className="ml-1 bg-accent-primary text-white text-xs rounded-full px-1.5">{activeUploads}</span>}
        </Button>
      </div>

      {/* view tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {VIEWS.map((v) => (
          <button key={v.key} onClick={() => go(v.key)} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${view === v.key ? 'bg-accent-primary/10 text-accent-primary-glow font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
            {v.label}
          </button>
        ))}
        {view === 'trash' && files.length + folders.length > 0 && (
          <button onClick={emptyTrash} className="ml-auto px-3 py-1.5 rounded-lg text-sm text-accent-red hover:bg-accent-red/10">Empty trash</button>
        )}
      </div>

      {/* breadcrumbs */}
      {view === 'my-drive' && (
        <div className="flex items-center gap-1 text-sm text-text-secondary mb-4 flex-wrap">
          <button onClick={() => go('my-drive')} className="flex items-center gap-1 hover:text-text-primary"><Home className="w-4 h-4" /> My Drive</button>
          {crumbs.map((c) => (
            <span key={c.id} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              <button onClick={() => go('my-drive', c.id)} className="hover:text-text-primary">{c.name}</button>
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>
      ) : view === 'storage' ? (
        <StorageView storage={storage} plans={plans} busy={busy} checkout={checkout} cancelSub={cancelSub} />
      ) : (
        <>
          {folders.length === 0 && visibleFiles.length === 0 ? (
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-12 text-center">
              <Cloud className="w-12 h-12 mx-auto text-text-muted mb-3" />
              <h3 className="font-bold text-text-primary mb-1">{view === 'trash' ? 'Trash is empty' : view === 'shared' ? 'Nothing shared with you yet' : q ? `No results for "${q}"` : 'This folder is empty'}</h3>
              <p className="text-sm text-text-secondary mb-4">Upload documents, images and business files to keep everything organized in one secure workspace.</p>
              {view === 'my-drive' && !q && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => fileInput.current?.click()}><Upload className="w-4 h-4 mr-2" /> Upload files</Button>
                  <Button variant="outline" onClick={() => setShowNew(true)}><FolderPlus className="w-4 h-4 mr-2" /> Create folder</Button>
                </div>
              )}
            </div>
          ) : grid ? (
            <div>
              {folders.length > 0 && (
                <>
                  <p className="text-xs text-text-muted mb-2">Folders</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
                    {folders.map((f) => (
                      <div key={f.id} onDoubleClick={() => go('my-drive', f.id)} onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setMenu({ x: e.clientX, y: e.clientY, folder: f }) }}
                        className="bg-bg-surface border border-border-subtle rounded-xl p-4 hover:border-border-hover cursor-pointer group">
                        <div className="flex items-start justify-between">
                          <FolderOpen className="w-8 h-8 text-accent-gold" />
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                            {f.is_starred && <Star className="w-3.5 h-3.5 text-accent-gold fill-current" />}
                            <button onClick={(e) => { e.stopPropagation(); setMenu({ x: e.clientX, y: e.clientY, folder: f }) }} className="text-text-muted hover:text-text-primary"><MoreVertical className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-text-primary truncate mt-2" onClick={() => go('my-drive', f.id)}>{f.name}</p>
                        <p className="text-xs text-text-muted">{fmtDate(f.updated_at)}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {visibleFiles.length > 0 && (
                <>
                  <p className="text-xs text-text-muted mb-2">Files {total > 0 && `(${total})`}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {visibleFiles.map((f) => {
                      const Icon = iconFor(f)
                      return (
                        <div key={f.id} onClick={() => openDetails(f)} onDoubleClick={() => doPreview(f)}
                          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setMenu({ x: e.clientX, y: e.clientY, file: f }) }}
                          className="bg-bg-surface border border-border-subtle rounded-xl p-4 hover:border-border-hover cursor-pointer group">
                          <div className="flex items-start justify-between">
                            <Icon className="w-8 h-8 text-accent-primary-glow" />
                            <div className="flex gap-1">
                              {f.is_starred && <Star className="w-3.5 h-3.5 text-accent-gold fill-current" />}
                              <button onClick={(e) => { e.stopPropagation(); setMenu({ x: e.clientX, y: e.clientY, file: f }) }} className="text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100"><MoreVertical className="w-4 h-4" /></button>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-text-primary truncate mt-2" title={f.name}>{f.name}</p>
                          <p className="text-xs text-text-muted">{fmtBytes(f.size_bytes)} · {fmtDate(f.updated_at)}</p>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-text-muted border-b border-border-subtle">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2 hidden sm:table-cell">Owner</th>
                    <th className="px-4 py-2 hidden md:table-cell">Modified</th>
                    <th className="px-4 py-2 hidden md:table-cell">Size</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {folders.map((f) => (
                    <tr key={f.id} className="border-b border-border-ghost hover:bg-bg-elevated cursor-pointer" onClick={() => go('my-drive', f.id)}>
                      <td className="px-4 py-2.5 text-text-primary flex items-center gap-2"><FolderOpen className="w-4 h-4 text-accent-gold" />{f.name}</td>
                      <td className="px-4 py-2.5 text-text-secondary hidden sm:table-cell">—</td>
                      <td className="px-4 py-2.5 text-text-secondary hidden md:table-cell">{fmtDate(f.updated_at)}</td>
                      <td className="px-4 py-2.5 text-text-secondary hidden md:table-cell">—</td>
                      <td className="px-4 py-2.5 text-right"><button onClick={(e) => { e.stopPropagation(); setMenu({ x: e.clientX, y: e.clientY, folder: f }) }} className="text-text-muted hover:text-text-primary"><MoreVertical className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                  {visibleFiles.map((f) => {
                    const Icon = iconFor(f)
                    return (
                      <tr key={f.id} className="border-b border-border-ghost hover:bg-bg-elevated cursor-pointer" onClick={() => openDetails(f)}>
                        <td className="px-4 py-2.5 text-text-primary flex items-center gap-2"><Icon className="w-4 h-4 text-accent-primary-glow" /><span className="truncate max-w-[220px]">{f.name}</span>{f.is_starred && <Star className="w-3 h-3 text-accent-gold fill-current" />}</td>
                        <td className="px-4 py-2.5 text-text-secondary hidden sm:table-cell">{f.created_by_name || '—'}</td>
                        <td className="px-4 py-2.5 text-text-secondary hidden md:table-cell">{fmtDate(f.updated_at)}</td>
                        <td className="px-4 py-2.5 text-text-secondary hidden md:table-cell">{fmtBytes(f.size_bytes)}</td>
                        <td className="px-4 py-2.5 text-right"><button onClick={(e) => { e.stopPropagation(); setMenu({ x: e.clientX, y: e.clientY, file: f }) }} className="text-text-muted hover:text-text-primary"><MoreVertical className="w-4 h-4" /></button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* drop zone overlay hint is the whole page via hidden inputs + drag handlers */}
      <DropCatcher onDrop={(files) => startUpload(files)} />

      {/* context menu */}
      {menu && (
        <div className="fixed z-40 bg-bg-elevated border border-border-default rounded-xl shadow-xl p-1.5 w-52" style={{ left: Math.min(menu.x, window.innerWidth - 220), top: Math.min(menu.y, window.innerHeight - 320) }} onClick={(e) => e.stopPropagation()}>
          {menu.file && (
            <>
              <MenuBtn icon={Eye} label="Preview" fn={() => { doPreview(menu.file as DriveFile); setMenu(null) }} />
              <MenuBtn icon={Download} label="Download" fn={() => { doDownload(menu.file as DriveFile); setMenu(null) }} />
              <MenuBtn icon={Share2} label="Share" fn={() => { const f = menu.file as DriveFile; openShare('file', f.id, f.name); setMenu(null) }} />
              <MenuBtn icon={Star} label={(menu.file as DriveFile).is_starred ? 'Unstar' : 'Add star'} fn={() => { const f = menu.file as DriveFile; doStar('file', f.id, f.is_starred); setMenu(null) }} />
              <MenuBtn icon={Eye} label="View details" fn={() => { openDetails(menu.file as DriveFile); setMenu(null) }} />
              {view === 'trash' ? (
                <>
                  <MenuBtn icon={RotateCcw} label="Restore" fn={() => { doRestore(menu.file as DriveFile); setMenu(null) }} />
                  <MenuBtn icon={Trash2} label="Delete forever" danger fn={() => { const f = menu.file as DriveFile; setDeleteTarget({ kind: 'file', id: f.id, name: f.name, permanent: true }); setMenu(null) }} />
                </>
              ) : (
                <>
                  <MenuBtn icon={FolderOpen} label="Move" fn={() => { const f = menu.file as DriveFile; setMoveTarget({ kind: 'file', id: f.id, name: f.name }); setMoveFolder('root'); setMenu(null) }} />
                  <MenuBtn icon={FileText} label="Rename" fn={() => { const f = menu.file as DriveFile; setRenameTarget({ kind: 'file', id: f.id, name: f.name }); setRenameValue(f.name); setMenu(null) }} />
                  <MenuBtn icon={Trash2} label="Move to trash" danger fn={() => { const f = menu.file as DriveFile; setDeleteTarget({ kind: 'file', id: f.id, name: f.name }); setMenu(null) }} />
                </>
              )}
            </>
          )}
          {menu.folder && (
            <>
              <MenuBtn icon={FolderOpen} label="Open" fn={() => { go('my-drive', (menu.folder as DriveFolder).id); setMenu(null) }} />
              <MenuBtn icon={Share2} label="Share" fn={() => { const f = menu.folder as DriveFolder; openShare('folder', f.id, f.name); setMenu(null) }} />
              <MenuBtn icon={Star} label={(menu.folder as DriveFolder).is_starred ? 'Unstar' : 'Add star'} fn={() => { const f = menu.folder as DriveFolder; doStar('folder', f.id, f.is_starred); setMenu(null) }} />
              <MenuBtn icon={FileText} label="Rename" fn={() => { const f = menu.folder as DriveFolder; setRenameTarget({ kind: 'folder', id: f.id, name: f.name }); setRenameValue(f.name); setMenu(null) }} />
              <MenuBtn icon={Trash2} label="Move to trash" danger fn={() => { const f = menu.folder as DriveFolder; setDeleteTarget({ kind: 'folder', id: f.id, name: f.name }); setMenu(null) }} />
            </>
          )}
        </div>
      )}

      {/* details drawer */}
      {selected && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-bg-base border-l border-border-default shadow-2xl overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-primary truncate pr-2">{selected.name}</h3>
            <button onClick={() => { setSelected(null); setDetail(null) }}><X className="w-5 h-5 text-text-muted" /></button>
          </div>
          <p className="text-xs text-text-secondary mb-4">{selected.mime_type} · {fmtBytes(selected.size_bytes)} · v{selected.version}</p>
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <Info label="Owner" value={selected.created_by_name || '—'} />
            <Info label="Modified" value={fmtDate(selected.updated_at)} />
            <Info label="Created" value={fmtDate(selected.created_at)} />
            <Info label="Location" value={(() => { const f = allFolders.find((x) => x.id === selected.folder_id); return f ? `My Drive / ${f.name}` : 'My Drive' })()} />
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            <Button size="sm" onClick={() => doPreview(selected)}><Eye className="w-3.5 h-3.5 mr-1" /> Open</Button>
            <Button size="sm" variant="outline" onClick={() => doDownload(selected)}><Download className="w-3.5 h-3.5 mr-1" /> Download</Button>
            <Button size="sm" variant="outline" onClick={() => openShare('file', selected.id, selected.name)}><Share2 className="w-3.5 h-3.5 mr-1" /> Share</Button>
            {view === 'trash'
              ? <><Button size="sm" variant="outline" onClick={() => doRestore(selected)}><RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore</Button>
                <Button size="sm" variant="outline" onClick={() => setDeleteTarget({ kind: 'file', id: selected.id, name: selected.name, permanent: true })}><Trash2 className="w-3.5 h-3.5 mr-1" /> Delete forever</Button></>
              : <Button size="sm" variant="outline" onClick={() => setDeleteTarget({ kind: 'file', id: selected.id, name: selected.name })}><Trash2 className="w-3.5 h-3.5 mr-1" /> Delete</Button>}
          </div>
          <div className="mb-5">
            <p className="text-xs font-semibold text-text-muted uppercase mb-2 flex items-center gap-1"><History className="w-3.5 h-3.5" /> Version history</p>
            {!detail ? <p className="text-xs text-text-muted">Loading...</p> : (detail.versions || []).length === 0 ? <p className="text-xs text-text-muted">Single version</p> : (
              <div className="space-y-1.5">
                {(detail.versions || []).map((v) => (
                  <div key={String(v.id)} className="flex items-center gap-2 text-xs bg-bg-surface rounded-lg px-2.5 py-2">
                    <span className="font-bold text-text-primary">v{String(v.version)}</span>
                    <span className="text-text-secondary truncate flex-1">{String(v.created_by_name || '')} · {fmtDate(String(v.created_at || ''))}</span>
                    {Number(v.version) !== selected.version && (
                      <button onClick={async () => { await api(`/api/drive/files/${selected.id}/versions`, { method: 'POST', body: JSON.stringify({ version_id: v.id }) }); openDetails({ ...selected }); load() }} className="text-accent-primary-glow hover:underline">Restore</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase mb-2 flex items-center gap-1"><Link2 className="w-3.5 h-3.5" /> Attached to records</p>
            {!detail ? <p className="text-xs text-text-muted">Loading...</p> : (detail.linked_to || []).length === 0 ? <p className="text-xs text-text-muted">Not attached to any record</p> : (
              <div className="space-y-1.5">
                {(detail.linked_to || []).map((l) => (
                  <div key={String(l.link_id || l.id)} className="text-xs bg-bg-surface rounded-lg px-2.5 py-2 text-text-secondary">{String(l.entity_type)} · {String(l.entity_id)}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-bg-base rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 p-4 border-b border-border-subtle">
              <p className="font-bold text-text-primary truncate flex-1">{preview.file.name}</p>
              <Button size="sm" variant="outline" onClick={() => doDownload(preview.file)}><Download className="w-3.5 h-3.5 mr-1" /> Download</Button>
              <button onClick={() => setPreview(null)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 min-h-[300px]">
              {preview.file.mime_type.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.url} alt={preview.file.name} className="max-w-full mx-auto rounded-lg" />
              ) : preview.file.mime_type.startsWith('video/') ? (
                <video src={preview.url} controls className="max-w-full mx-auto rounded-lg" />
              ) : preview.file.mime_type.startsWith('audio/') ? (
                <audio src={preview.url} controls className="w-full" />
              ) : preview.text !== undefined ? (
                <pre className="text-xs text-text-primary whitespace-pre-wrap font-mono bg-bg-surface rounded-lg p-4">{preview.text}</pre>
              ) : preview.file.mime_type === 'application/pdf' ? (
                <embed src={preview.url} type="application/pdf" className="w-full h-[65vh] rounded-lg" />
              ) : (
                <div className="text-center py-12">
                  <FileIcon className="w-12 h-12 mx-auto text-text-muted mb-3" />
                  <p className="text-sm text-text-secondary mb-3">No in-app preview for this file type. Download to view.</p>
                  <Button onClick={() => doDownload(preview.file)}><Download className="w-4 h-4 mr-2" /> Download {fmtBytes(preview.file.size_bytes)}</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* rename dialog */}
      {renameTarget && (
        <Modal title={`Rename ${renameTarget.kind}`} onClose={() => setRenameTarget(null)}>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doRename()} />
          <div className="flex gap-2 justify-end mt-3">
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button disabled={busy} onClick={doRename} className="bg-accent-primary text-white">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Rename'}</Button>
          </div>
        </Modal>
      )}

      {/* move dialog */}
      {moveTarget && (
        <Modal title={`Move "${moveTarget.name}"`} onClose={() => setMoveTarget(null)}>
          <select value={moveFolder} onChange={(e) => setMoveFolder(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border-default bg-bg-base text-sm text-text-primary">
            <option value="root">My Drive (root)</option>
            {flatFolders.filter(({ f }) => f.id !== moveTarget.id).map(({ f, depth }) => (
              <option key={f.id} value={f.id}>{`${'— '.repeat(depth)}${f.name}`}</option>
            ))}
          </select>
          <div className="flex gap-2 justify-end mt-3">
            <Button variant="outline" onClick={() => setMoveTarget(null)}>Cancel</Button>
            <Button disabled={busy} onClick={doMove} className="bg-accent-primary text-white">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Move'}</Button>
          </div>
        </Modal>
      )}

      {/* share dialog */}
      {shareTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShareTarget(null)}>
          <div className="bg-bg-base rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-text-primary">Share “{shareTarget.name}”</h3>
              <button onClick={() => setShareTarget(null)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <p className="text-xs text-text-secondary mb-4 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Internal workspace sharing — never public by default.</p>
            <div className="flex gap-2 mb-3">
              <Input value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="teammate@company.com" />
              <select value={sharePerm} onChange={(e) => setSharePerm(e.target.value)} className="px-2 py-2 rounded-lg border border-border-default bg-bg-base text-sm text-text-primary">
                <option value="viewer">Viewer</option>
                <option value="commenter">Commenter</option>
                <option value="editor">Editor</option>
              </select>
              <Button disabled={busy} onClick={addShare} className="bg-accent-primary text-white">Add</Button>
            </div>
            <div className="space-y-1.5 mb-5">
              {shares.map((s) => (
                <div key={String(s.id)} className="flex items-center gap-2 text-sm bg-bg-surface rounded-lg px-3 py-2">
                  <span className="flex-1 text-text-primary truncate">{String(s.shared_with_email || s.shared_with_user_id)}</span>
                  <span className="text-xs text-text-muted">{String(s.permission)}</span>
                  <button onClick={() => revokeShare(String(s.id))} className="text-accent-red text-xs hover:underline">Remove</button>
                </div>
              ))}
              {shares.length === 0 && <p className="text-xs text-text-muted">Only you have access.</p>}
            </div>
            <p className="text-xs font-semibold text-text-muted uppercase mb-2 flex items-center gap-1"><Link2 className="w-3.5 h-3.5" /> Secure links</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Input type="date" value={linkExpiry} onChange={(e) => setLinkExpiry(e.target.value)} className="max-w-[170px]" />
              <Input value={linkPassword} onChange={(e) => setLinkPassword(e.target.value)} placeholder="Password (optional)" className="max-w-[170px]" />
              <Button disabled={busy} variant="outline" onClick={createLink}>Create link</Button>
            </div>
            <div className="space-y-1.5">
              {links.map((l) => (
                <div key={String(l.id)} className="flex items-center gap-2 text-xs bg-bg-surface rounded-lg px-3 py-2">
                  <Lock className="w-3.5 h-3.5 text-accent-gold" />
                  <span className="flex-1 text-text-secondary truncate font-mono">/api/drive/s/{String(l.token).slice(0, 12)}…</span>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/api/drive/s/${String(l.token)}`); setNotice('Link copied.') }} className="text-accent-primary-glow hover:underline flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>
                  <button onClick={() => revokeLink(String(l.id))} className="text-accent-red hover:underline">Revoke</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* delete confirm */}
      {deleteTarget && (
        <Modal title={deleteTarget.permanent ? 'Delete forever?' : `Move "${deleteTarget.name}" to trash?`} onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-text-secondary">{deleteTarget.permanent ? 'The file bytes and all versions will be permanently destroyed and storage freed. This cannot be undone.' : 'You can restore it from Trash within your plan retention period.'}</p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button disabled={busy} onClick={doDelete} className="bg-accent-red text-white">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : deleteTarget.permanent ? 'Delete forever' : 'Move to trash'}</Button>
          </div>
        </Modal>
      )}

      {/* upload manager */}
      {showUploads && (
        <div className="fixed bottom-4 right-4 z-50 w-[340px] max-w-[90vw] bg-bg-elevated border border-border-default rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 p-3 border-b border-border-subtle">
            <Upload className="w-4 h-4 text-accent-primary-glow" />
            <p className="font-bold text-sm text-text-primary flex-1">Uploads</p>
            <button onClick={() => setShowUploads(false)}><X className="w-4 h-4 text-text-muted" /></button>
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-2 space-y-2">
            {uploads.length === 0 && <p className="text-xs text-text-muted p-2">No uploads yet.</p>}
            {[...uploads].reverse().map((u) => (
              <div key={u.id} className="bg-bg-surface rounded-lg p-2.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-text-primary truncate flex-1">{u.name}</p>
                  {u.status === 'uploading' && <button onClick={() => cancelUpload(u)} className="text-xs text-text-muted hover:text-accent-red">Cancel</button>}
                  {u.status === 'done' && <Check className="w-4 h-4 text-accent-emerald" />}
                </div>
                <div className="h-1.5 bg-bg-base rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${u.status === 'error' ? 'bg-accent-red' : u.status === 'done' ? 'bg-accent-emerald' : 'bg-accent-primary'}`} style={{ width: `${u.status === 'done' ? 100 : u.progress}%` }} />
                </div>
                <p className="text-[11px] text-text-muted mt-1">
                  {u.status === 'uploading' && `${u.progress}% · ${fmtBytes(u.size)}`}
                  {u.status === 'done' && 'Uploaded'}
                  {u.status === 'cancelled' && 'Cancelled'}
                  {u.status === 'error' && <span className="text-accent-red">{u.error}</span>}
                </p>
                {u.status === 'error' && u.duplicate && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[['replace', 'Replace'], ['keep_both', 'Keep both'], ['new_version', 'New version']].map(([m, label]) => (
                      <button key={m} onClick={() => retryUpload(u, m)} className="text-[11px] px-2 py-1 rounded-md bg-accent-primary/10 text-accent-primary-glow hover:bg-accent-primary/20">{label}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MenuBtn({ icon: Icon, label, fn, danger = false }: { icon: typeof Eye; label: string; fn: () => void; danger?: boolean }) {
  return (
    <button onClick={fn} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${danger ? 'text-accent-red hover:bg-accent-red/10' : 'text-text-primary hover:bg-bg-surface'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-surface rounded-lg p-2.5">
      <p className="text-[11px] text-text-muted uppercase">{label}</p>
      <p className="text-sm text-text-primary truncate">{value}</p>
    </div>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg-base rounded-2xl max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-text-primary mb-3">{title}</h3>
        {children}
      </div>
    </div>
  )
}

function DropCatcher({ onDrop }: { onDrop: (files: FileList) => void }) {
  const [over, setOver] = useState(false)
  const counter = useRef(0)
  return (
    <div
      className={`fixed inset-0 z-30 pointer-events-none border-4 border-dashed rounded-2xl m-2 transition ${over ? 'border-accent-primary bg-accent-primary/5 pointer-events-auto' : 'border-transparent'}`}
      onDragEnter={(e) => { e.preventDefault(); counter.current += 1; setOver(true) }}
      onDragLeave={(e) => { e.preventDefault(); counter.current -= 1; if (counter.current <= 0) { counter.current = 0; setOver(false) } }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); counter.current = 0; setOver(false); if (e.dataTransfer.files.length) onDrop(e.dataTransfer.files) }}
    >
      {over && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-lg font-bold text-accent-primary-glow bg-bg-base px-6 py-3 rounded-xl border border-accent-primary">Drop files to upload</p>
        </div>
      )}
    </div>
  )
}

function StorageView({ storage, plans, busy, checkout, cancelSub }: {
  storage: Record<string, unknown> | null
  plans: Array<Record<string, unknown>>
  busy: boolean
  checkout: (planId: string, cycle: 'monthly' | 'annual') => void
  cancelSub: () => void
}) {
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly')
  if (!storage) return <div className="flex items-center justify-center min-h-[200px]"><Loader2 className="w-8 h-8 animate-spin text-accent-primary" /></div>
  const pct = Number(storage.percent_used || 0)
  const breakdown = (storage.breakdown || {}) as Record<string, { bytes: number; count: number }>
  const largest = (storage.largest || []) as Array<Record<string, unknown>>
  const sub = (storage.subscription || {}) as Record<string, unknown>
  return (
    <div className="space-y-5">
      {'error' in storage && <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3 text-accent-red text-sm">{String(storage.error)}</div>}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="w-5 h-5 text-accent-primary-glow" />
          <h3 className="font-bold text-text-primary">Storage — {String((storage.plan as Record<string, unknown> | undefined)?.name || '')} plan</h3>
          <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${pct >= 100 ? 'bg-accent-red/15 text-accent-red' : pct >= 90 ? 'bg-accent-orange/15 text-accent-orange' : 'bg-accent-emerald/15 text-accent-emerald'}`}>
            {pct >= 100 ? 'FULL' : pct >= 90 ? 'ALMOST FULL' : `${pct}% used`}
          </span>
        </div>
        <p className="text-sm text-text-secondary mb-2">{String(storage.used_display)} of {String(storage.quota_display)} · {String(storage.file_count || 0)} files{Number(storage.trash_bytes || 0) > 0 && ` · ${String(storage.trash_display)} in trash (counts toward quota)`}</p>
        <div className="h-3 bg-bg-base rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${pct >= 100 ? 'bg-accent-red' : pct >= 90 ? 'bg-accent-orange' : 'bg-accent-primary'}`} style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        {pct >= 90 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" className="bg-accent-gold text-white" onClick={() => document.getElementById('storage-plans')?.scrollIntoView({ behavior: 'smooth' })}>Upgrade storage</Button>
            <Button size="sm" variant="outline" onClick={() => { window.location.href = '/dashboard/drive?view=trash' }}>Free up space</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <h4 className="font-bold text-text-primary mb-3 text-sm">Usage by type</h4>
          {Object.entries(breakdown).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 text-sm mb-1.5">
              <span className="capitalize text-text-secondary w-24">{k}</span>
              <div className="flex-1 h-2 bg-bg-base rounded-full overflow-hidden">
                <div className="h-full bg-accent-primary rounded-full" style={{ width: `${Number(storage.used_bytes || 0) ? Math.min(100, Math.round((v.bytes / Number(storage.used_bytes || 1)) * 100)) : 0}%` }} />
              </div>
              <span className="text-text-primary font-mono text-xs w-24 text-right">{fmtBytes(v.bytes)} · {v.count}</span>
            </div>
          ))}
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
          <h4 className="font-bold text-text-primary mb-3 text-sm">Largest files</h4>
          {largest.length === 0 && <p className="text-xs text-text-muted">No files yet.</p>}
          {largest.map((f, i) => (
            <div key={String(f.id)} className="flex items-center gap-2 text-sm mb-1.5">
              <span className="text-text-muted font-mono text-xs w-5">{i + 1}.</span>
              <span className="text-text-primary truncate flex-1">{String(f.name)}</span>
              <span className="text-text-secondary font-mono text-xs">{fmtBytes(Number(f.size_bytes || 0))}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5">
        <h4 className="font-bold text-text-primary mb-1 text-sm">Current subscription</h4>
        <p className="text-xs text-text-secondary mb-3">
          {sub && sub.plan_name ? `${String(sub.plan_name)} · ${String(sub.billing_cycle || 'monthly')} · ${String(sub.status || '')}${sub.renews_at ? ` · renews ${fmtDate(String(sub.renews_at))}` : ''}` : 'Free plan'}
        </p>
        <Button size="sm" variant="outline" onClick={cancelSub} disabled={busy}>Cancel subscription</Button>
      </div>

      <div id="storage-plans">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-5 h-5 text-accent-gold" />
          <h3 className="font-bold text-text-primary">Storage plans</h3>
          <div className="ml-auto flex gap-1 text-xs">
            <button onClick={() => setCycle('monthly')} className={`px-2.5 py-1 rounded-lg ${cycle === 'monthly' ? 'bg-accent-primary/15 text-accent-primary-glow font-bold' : 'text-text-muted'}`}>Monthly</button>
            <button onClick={() => setCycle('annual')} className={`px-2.5 py-1 rounded-lg ${cycle === 'annual' ? 'bg-accent-primary/15 text-accent-primary-glow font-bold' : 'text-text-muted'}`}>Annual</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {plans.map((p) => {
            const price = cycle === 'annual' ? Number(p.price_annual_ngn || 0) : Number(p.price_monthly_ngn || 0)
            return (
              <div key={String(p.id)} className="bg-bg-surface border border-border-subtle rounded-2xl p-4">
                <h4 className="font-bold text-text-primary">{String(p.name)}</h4>
                <p className="text-xl font-bold font-mono text-text-primary">{price > 0 ? `₦${price.toLocaleString()}` : 'Custom'}<span className="text-xs font-normal text-text-muted">{price > 0 ? `/${cycle === 'annual' ? 'yr' : 'mo'}` : ''}</span></p>
                <p className="text-xs text-text-secondary mb-2">{fmtBytes(Number(p.capacity_bytes || 0))} · up to {String(p.max_users)} users · {String(p.retention_days)}-day trash retention</p>
                <ul className="text-xs text-text-secondary space-y-1 mb-3">
                  {((p.features as string[]) || []).slice(0, 4).map((f) => <li key={f} className="flex gap-1.5"><Check className="w-3 h-3 text-accent-emerald mt-0.5 flex-shrink-0" />{f}</li>)}
                </ul>
                <Button size="sm" disabled={busy || price <= 0} onClick={() => checkout(String(p.id), cycle)} className="w-full bg-accent-primary text-white disabled:opacity-50">
                  {price <= 0 ? 'Contact admin' : `Choose ${cycle}`}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
