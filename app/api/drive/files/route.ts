import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import {
  resolveBusinessId, getStorageContext, quotaCheck, addUsage, maybeWarnQuota,
  putObject, sha256Hex, extOf, mimeFor, driveActivity, formatBytes,
  ALLOWED_EXTENSIONS, type Row,
} from '@/lib/drive/server'

const db = new DBClient()

// GET /api/drive/files?folder=<id|root>&starred=1&trashed=1&limit&offset&sort&order
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const url = new URL(request.url)
    const folder = url.searchParams.get('folder')
    const starred = url.searchParams.get('starred') === '1'
    const trashed = url.searchParams.get('trashed') === '1'
    const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit') || 200)))
    const offset = Math.max(0, Number(url.searchParams.get('offset') || 0))
    const sort = url.searchParams.get('sort') || 'modified'
    const order = (url.searchParams.get('order') || 'desc').toLowerCase() === 'asc' ? 1 : -1
    const { data, error } = await db.from('cloud_files').select('*').eq('business_id', businessId).limit(5000)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    let rows = ((data as unknown as Row[]) || []).filter((f) => (trashed ? !!f.trashed_at : !f.trashed_at))
    if (folder && folder !== 'all') {
      rows = rows.filter((f) => (folder === 'root' ? !f.folder_id : String(f.folder_id) === folder))
    }
    if (starred) rows = rows.filter((f) => f.is_starred)
    const key = sort === 'name' ? 'name' : sort === 'size' ? 'size_bytes' : 'updated_at'
    rows.sort((a, b) => {
      const av = a[key]; const bv = b[key]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * order
      return String(av || '').localeCompare(String(bv || '')) * order
    })
    return NextResponse.json({ files: rows.slice(offset, offset + limit), total: rows.length })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 150) || 'file'
}

// POST /api/drive/files (multipart) — fields: files[], folder_id?, on_duplicate=keep_both|replace|new_version|cancel
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const form = await request.formData()
    const folderId = form.get('folder_id') ? String(form.get('folder_id')) : null
    const onDup = String(form.get('on_duplicate') || 'keep_both')
    if (folderId) {
      const { data: parent } = await db.from('cloud_folders').select('*').eq('id', folderId).eq('business_id', businessId).single()
      if (!parent) return NextResponse.json({ error: 'Target folder not found' }, { status: 404 })
      if ((parent as unknown as Row).trashed_at) return NextResponse.json({ error: 'Target folder is in trash' }, { status: 400 })
    }
    const uploads = form.getAll('files').filter((v): v is File => v instanceof File)
    if (uploads.length === 0) return NextResponse.json({ error: 'No files attached (field: files)' }, { status: 400 })

    const results: Row[] = []
    for (const file of uploads) {
      const original = file.name || 'untitled'
      const ext = extOf(original)
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        results.push({ name: original, ok: false, error: `File type .${ext || '?'} is not allowed` })
        continue
      }
      const bytes = new Uint8Array(await file.arrayBuffer())
      // Never trust client-reported size: measure the actual bytes server-side.
      const size = bytes.byteLength
      const ctx = await getStorageContext(businessId)
      const check = quotaCheck(ctx, size)
      if (!check.ok) {
        results.push({ name: original, ok: false, error: check.reason })
        continue
      }
      const { data: existing } = await db.from('cloud_files').select('*').eq('business_id', businessId).limit(5000)
      const dup = ((existing as unknown as Row[]) || []).find(
        (f) => !f.trashed_at && String(f.folder_id || '') === String(folderId || '') && String(f.name).toLowerCase() === original.toLowerCase()
      )
      if (dup && onDup === 'cancel') {
        results.push({ name: original, ok: false, error: 'A file with this name already exists', duplicate: true })
        continue
      }
      const now = new Date().toISOString()
      const checksum = sha256Hex(bytes)
      const mime = file.type || mimeFor(original)
      const key = `${businessId}/${crypto.randomUUID()}-${sanitize(original)}`
      await putObject(key, bytes, mime)

      if (dup && (onDup === 'replace' || onDup === 'new_version')) {
        // Snapshot current bytes as a version, then swap in the new upload.
        await db.from('cloud_file_versions').insert({
          file_id: String(dup.id), business_id: businessId, version: Number(dup.version || 1),
          storage_key: String(dup.storage_key), size_bytes: Number(dup.size_bytes || 0),
          checksum: String(dup.checksum || ''), created_by: auth.user.userId, created_by_name: auth.user.name,
          note: onDup === 'replace' ? 'Replaced by new upload' : 'Previous version', created_at: now,
        })
        const delta = size - Number(dup.size_bytes || 0)
        const { data: updated, error } = await db.from('cloud_files').update({
          storage_key: key, size_bytes: size, checksum, mime_type: mime,
          version: Number(dup.version || 1) + 1, updated_at: now,
        }).eq('id', String(dup.id)).select().single()
        if (error) { results.push({ name: original, ok: false, error: error.message }); continue }
        if (delta !== 0) await addUsage(businessId, delta, 0)
        await driveActivity({ business_id: businessId, file_id: String(dup.id), actor_user_id: auth.user.userId, actor_name: auth.user.name, action: onDup === 'replace' ? 'replaced' : 'new_version', details: { name: original, size }, request })
        const c2 = await getStorageContext(businessId)
        await maybeWarnQuota(businessId, c2, auth.user.userId)
        results.push({ ...(updated as unknown as Row), ok: true })
        continue
      }

      const finalName = dup && onDup === 'keep_both'
        ? original.replace(/(\.[^.]+)?$/, (m) => ` (1)${m}`)
        : original
      const { data: created, error } = await db.from('cloud_files').insert({
        business_id: businessId, folder_id: folderId, name: finalName,
        mime_type: mime, extension: ext, size_bytes: size,
        storage_provider: 'supabase', storage_key: key, checksum, version: 1,
        tags: [], created_by: auth.user.userId, created_by_name: auth.user.name,
        created_at: now, updated_at: now,
      }).select().single()
      if (error || !created) { results.push({ name: original, ok: false, error: error?.message || 'Insert failed' }); continue }
      const fileRow = created as unknown as Row
      await db.from('cloud_file_versions').insert({
        file_id: String(fileRow.id), business_id: businessId, version: 1,
        storage_key: key, size_bytes: size, checksum,
        created_by: auth.user.userId, created_by_name: auth.user.name, note: 'Original upload', created_at: now,
      })
      await addUsage(businessId, size, 1)
      await driveActivity({ business_id: businessId, file_id: String(fileRow.id), actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'uploaded', details: { name: finalName, size, mime }, request })
      results.push({ ...fileRow, ok: true })
    }
    const ctx = await getStorageContext(businessId)
    await maybeWarnQuota(businessId, ctx, auth.user.userId)
    const failed = results.filter((r) => !r.ok)
    return NextResponse.json({
      results,
      uploaded: results.length - failed.length,
      failed: failed.length,
      usage: { used_bytes: ctx.used_bytes, quota: Number(ctx.plan.capacity_bytes || 0), used_display: formatBytes(ctx.used_bytes) },
    }, { status: failed.length && failed.length === results.length ? 400 : 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
