import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, driveFileRow, driveActivity, type Row } from '@/lib/drive/server'
import { notifyUser } from '@/lib/operations/server'

const db = new DBClient()
const PERMS = new Set(['viewer', 'commenter', 'editor'])

// GET /api/drive/files/[id]/shares — list internal shares (owner only)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  const file = await driveFileRow(businessId, params.id)
  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 })
  if (String(file.created_by || '') !== auth.user.userId && auth.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: only the owner can manage sharing' }, { status: 403 })
  }
  const { data } = await db.from('cloud_file_shares').select('*').eq('file_id', params.id).limit(500)
  return NextResponse.json({ shares: ((data as unknown as Row[]) || []) })
}

// POST /api/drive/files/[id]/shares { user_id?, email?, permission } — owner only
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const file = await driveFileRow(businessId, params.id)
    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 })
    if (String(file.created_by || '') !== auth.user.userId && auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: only the owner can share' }, { status: 403 })
    }
    const body = (await request.json()) as Row
    const permission = String(body.permission || 'viewer')
    if (!PERMS.has(permission)) return NextResponse.json({ error: 'permission must be viewer, commenter or editor' }, { status: 400 })
    const userId = String(body.user_id || '')
    const email = String(body.email || '').trim().toLowerCase()
    if (!userId && !email) return NextResponse.json({ error: 'user_id or email is required' }, { status: 400 })
    const { data, error } = await db.from('cloud_file_shares').insert({
      business_id: businessId, file_id: params.id, folder_id: null,
      shared_with_user_id: userId, shared_with_email: email, permission,
      created_by: auth.user.userId, created_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (userId) {
      await notifyUser({
        recipient_user_id: userId, kind: 'file_shared',
        title: `File shared with you: ${String(file.name)}`,
        message: `${auth.user.name} shared "${String(file.name)}" with ${permission} access.`,
        entity_type: 'cloud_file', entity_id: params.id,
      })
    }
    await driveActivity({ business_id: businessId, file_id: params.id, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'shared', details: { with: userId || email, permission }, request })
    return NextResponse.json({ share: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// DELETE /api/drive/files/[id]/shares?share_id= — revoke (owner only)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  const file = await driveFileRow(businessId, params.id)
  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 })
  if (String(file.created_by || '') !== auth.user.userId && auth.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: only the owner can revoke sharing' }, { status: 403 })
  }
  const shareId = new URL(request.url).searchParams.get('share_id')
  if (!shareId) return NextResponse.json({ error: 'share_id is required' }, { status: 400 })
  const { error } = await db.from('cloud_file_shares').delete().eq('id', shareId).eq('file_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await driveActivity({ business_id: businessId, file_id: params.id, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'share_revoked', details: { share_id: shareId }, request })
  return NextResponse.json({ ok: true })
}
