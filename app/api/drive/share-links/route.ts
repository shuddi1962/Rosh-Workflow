import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, driveFileRow, driveFolderRow, driveActivity, type Row } from '@/lib/drive/server'
import { hashSensitive } from '@/lib/encryption'

const db = new DBClient()

// GET /api/drive/share-links — list workspace links
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  const { data } = await db.from('cloud_share_links').select('*').eq('business_id', businessId).limit(500)
  return NextResponse.json({ links: ((data as unknown as Row[]) || []) })
}

// POST /api/drive/share-links { file_id?, folder_id?, permission?, expires_at?, password?, max_downloads? }
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const { data: toggle } = await db.from('feature_toggles').select('*').eq('feature_key', 'drive_public_links_enabled').single()
    const linksAllowed = Boolean((toggle as unknown as Row | null)?.is_enabled)
    if (!linksAllowed && auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Public share links are disabled by your administrator' }, { status: 403 })
    }
    const body = (await request.json()) as Row
    const fileId = body.file_id ? String(body.file_id) : null
    const folderId = body.folder_id ? String(body.folder_id) : null
    if ((!fileId && !folderId) || (fileId && folderId)) {
      return NextResponse.json({ error: 'Provide exactly one of file_id or folder_id' }, { status: 400 })
    }
    if (fileId) {
      const f = await driveFileRow(businessId, fileId)
      if (!f) return NextResponse.json({ error: 'File not found' }, { status: 404 })
      if (String(f.created_by || '') !== auth.user.userId && auth.user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: only the owner can create links' }, { status: 403 })
      }
    } else if (folderId) {
      const f = await driveFolderRow(businessId, folderId as string)
      if (!f) return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }
    const permission = String(body.permission || 'viewer')
    if (!['viewer', 'editor'].includes(permission)) return NextResponse.json({ error: 'permission must be viewer or editor' }, { status: 400 })
    const token = crypto.randomBytes(24).toString('hex')
    const password = String(body.password || '')
    const { data, error } = await db.from('cloud_share_links').insert({
      business_id: businessId, file_id: fileId, folder_id: folderId, token, permission,
      password_hash: password ? hashSensitive(password) : '',
      expires_at: body.expires_at ? new Date(String(body.expires_at)).toISOString() : null,
      max_downloads: body.max_downloads ? Number(body.max_downloads) : null,
      created_by: auth.user.userId, created_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await driveActivity({ business_id: businessId, file_id: fileId, folder_id: folderId, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'link_created', details: { permission }, request })
    return NextResponse.json({ link: data, url: `/drive/s/${token}` }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// DELETE /api/drive/share-links?link_id= — revoke
export async function DELETE(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  const linkId = new URL(request.url).searchParams.get('link_id')
  if (!linkId) return NextResponse.json({ error: 'link_id is required' }, { status: 400 })
  const { data: link } = await db.from('cloud_share_links').select('*').eq('id', linkId).eq('business_id', businessId).single()
  if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  const l = link as unknown as Row
  if (String(l.created_by || '') !== auth.user.userId && auth.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await db.from('cloud_share_links').delete().eq('id', linkId)
  await driveActivity({ business_id: businessId, file_id: l.file_id ? String(l.file_id) : null, folder_id: l.folder_id ? String(l.folder_id) : null, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'link_revoked', details: {}, request })
  return NextResponse.json({ ok: true })
}
