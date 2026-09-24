import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import {
  resolveBusinessId, driveFileRow, filePermission, signedUrl, removeObject,
  addUsage, driveActivity, type Row,
} from '@/lib/drive/server'

const db = new DBClient()

// GET /api/drive/files/[id]?view=1 — metadata + signed preview/download URL
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const file = await driveFileRow(businessId, params.id)
    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 })
    const perm = await filePermission(businessId, file, auth.user)
    if (!perm) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const url = new URL(request.url)
    if (url.searchParams.get('view') === '1') {
      await db.from('cloud_files').update({ last_opened_at: new Date().toISOString() }).eq('id', params.id)
      await driveActivity({ business_id: businessId, file_id: params.id, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'viewed', details: { name: String(file.name) }, request })
    }
    const downloadUrl = await signedUrl(String(file.storage_key), 3600)
    const { data: versions } = await db.from('cloud_file_versions').select('*').eq('file_id', params.id).limit(100)
    const { data: links } = await db.from('cloud_file_links').select('*').eq('file_id', params.id).limit(100)
    return NextResponse.json({
      file, permission: perm, downloadUrl,
      versions: (((versions as unknown as Row[]) || []).sort((a, b) => Number(b.version) - Number(a.version))),
      linked_to: ((links as unknown as Row[]) || []),
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// PUT /api/drive/files/[id] { name?, folder_id?, is_starred? } — needs editor+
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const file = await driveFileRow(businessId, params.id)
    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 })
    const perm = await filePermission(businessId, file, auth.user)
    if (perm !== 'owner' && perm !== 'editor') return NextResponse.json({ error: 'Forbidden: editor access required' }, { status: 403 })
    const body = (await request.json()) as Row
    const patch: Row = { updated_at: new Date().toISOString() }
    if (body.name !== undefined) {
      const name = String(body.name).trim().slice(0, 200)
      if (!name) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      const { data: sibs } = await db.from('cloud_files').select('*').eq('business_id', businessId).limit(5000)
      const clash = ((sibs as unknown as Row[]) || []).find(
        (f) => String(f.id) !== params.id && !f.trashed_at && String(f.folder_id || '') === String(file.folder_id || '') && String(f.name).toLowerCase() === name.toLowerCase()
      )
      if (clash) return NextResponse.json({ error: 'A file with this name already exists here', duplicate: true }, { status: 409 })
      patch.name = name
    }
    if (body.folder_id !== undefined) {
      const fid = body.folder_id ? String(body.folder_id) : null
      if (fid) {
        const { data: parent } = await db.from('cloud_folders').select('*').eq('id', fid).eq('business_id', businessId).single()
        if (!parent) return NextResponse.json({ error: 'Target folder not found' }, { status: 404 })
      }
      patch.folder_id = fid
    }
    if (body.is_starred !== undefined) patch.is_starred = Boolean(body.is_starred)
    const { data, error } = await db.from('cloud_files').update(patch).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await driveActivity({ business_id: businessId, file_id: params.id, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: patch.folder_id !== undefined ? 'moved' : 'renamed', details: patch, request })
    return NextResponse.json({ file: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// DELETE /api/drive/files/[id] — trash (?permanent=1 destroys bytes + rows)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const file = await driveFileRow(businessId, params.id)
    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 })
    const perm = await filePermission(businessId, file, auth.user)
    if (perm !== 'owner' && perm !== 'editor') return NextResponse.json({ error: 'Forbidden: editor access required' }, { status: 403 })
    const permanent = new URL(request.url).searchParams.get('permanent') === '1'
    if (permanent) {
      const { data: versions } = await db.from('cloud_file_versions').select('*').eq('file_id', params.id).limit(200)
      const keys = new Set<string>([String(file.storage_key)])
      for (const v of ((versions as unknown as Row[]) || [])) keys.add(String(v.storage_key))
      for (const k of keys) { try { await removeObject(k) } catch { /* already gone */ } }
      await db.from('cloud_file_versions').delete().eq('file_id', params.id)
      await db.from('cloud_file_shares').delete().eq('file_id', params.id)
      await db.from('cloud_share_links').delete().eq('file_id', params.id)
      await db.from('cloud_file_links').delete().eq('file_id', params.id)
      await db.from('cloud_file_activity').delete().eq('file_id', params.id)
      await db.from('cloud_files').delete().eq('id', params.id)
      await addUsage(businessId, -Number(file.size_bytes || 0), -1)
      await driveActivity({ business_id: businessId, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'destroyed', details: { name: String(file.name), size: Number(file.size_bytes || 0) }, request })
      return NextResponse.json({ ok: true, permanent: true })
    }
    const now = new Date().toISOString()
    await db.from('cloud_files').update({ trashed_at: now, trashed_by: auth.user.userId }).eq('id', params.id)
    await driveActivity({ business_id: businessId, file_id: params.id, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'trashed', details: { name: String(file.name) }, request })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
