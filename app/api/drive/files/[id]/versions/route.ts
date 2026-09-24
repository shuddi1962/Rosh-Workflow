import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import {
  resolveBusinessId, driveFileRow, filePermission, getObjectBytes, putObject,
  sha256Hex, addUsage, driveActivity, type Row,
} from '@/lib/drive/server'

const db = new DBClient()

// GET /api/drive/files/[id]/versions — version history
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  const file = await driveFileRow(businessId, params.id)
  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 })
  const perm = await filePermission(businessId, file, auth.user)
  if (!perm) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data } = await db.from('cloud_file_versions').select('*').eq('file_id', params.id).limit(200)
  const versions = (((data as unknown as Row[]) || []).sort((a, b) => Number(b.version) - Number(a.version)))
  return NextResponse.json({ versions })
}

// POST /api/drive/files/[id]/versions { version_id } — restore a version (editor+)
export async function POST(request: Request, { params }: { params: { id: string } }) {
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
    const { data: ver } = await db.from('cloud_file_versions').select('*').eq('id', String(body.version_id || '')).eq('file_id', params.id).single()
    if (!ver) return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    const v = ver as unknown as Row
    const bytes = await getObjectBytes(String(v.storage_key))
    const now = new Date().toISOString()
    // Snapshot the current state first so nothing is ever silently lost.
    await db.from('cloud_file_versions').insert({
      file_id: params.id, business_id: businessId, version: Number(file.version || 1),
      storage_key: String(file.storage_key), size_bytes: Number(file.size_bytes || 0),
      checksum: String(file.checksum || ''), created_by: auth.user.userId, created_by_name: auth.user.name,
      note: 'Auto-snapshot before version restore', created_at: now,
    })
    await putObject(String(file.storage_key), bytes, String(file.mime_type || 'application/octet-stream'))
    const delta = bytes.byteLength - Number(file.size_bytes || 0)
    const { data: updated, error } = await db.from('cloud_files').update({
      size_bytes: bytes.byteLength, checksum: sha256Hex(bytes),
      version: Number(file.version || 1) + 1, updated_at: now,
    }).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (delta !== 0) await addUsage(businessId, delta, 0)
    await driveActivity({ business_id: businessId, file_id: params.id, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'version_restored', details: { from_version: Number(v.version) }, request })
    return NextResponse.json({ file: updated })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
