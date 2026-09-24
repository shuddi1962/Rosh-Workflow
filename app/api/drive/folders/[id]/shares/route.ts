import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, driveFolderRow, driveActivity, type Row } from '@/lib/drive/server'

const db = new DBClient()
const PERMS = new Set(['viewer', 'commenter', 'editor'])

// GET /api/drive/folders/[id]/shares — list (owner/admin of workspace)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  const folder = await driveFolderRow(businessId, params.id)
  if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
  const { data } = await db.from('cloud_file_shares').select('*').eq('folder_id', params.id).limit(500)
  return NextResponse.json({ shares: ((data as unknown as Row[]) || []) })
}

// POST /api/drive/folders/[id]/shares { user_id?, email?, permission }
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const folder = await driveFolderRow(businessId, params.id)
    if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    const body = (await request.json()) as Row
    const permission = String(body.permission || 'viewer')
    if (!PERMS.has(permission)) return NextResponse.json({ error: 'permission must be viewer, commenter or editor' }, { status: 400 })
    const userId = String(body.user_id || '')
    const email = String(body.email || '').trim().toLowerCase()
    if (!userId && !email) return NextResponse.json({ error: 'user_id or email is required' }, { status: 400 })
    const { data, error } = await db.from('cloud_file_shares').insert({
      business_id: businessId, file_id: null, folder_id: params.id,
      shared_with_user_id: userId, shared_with_email: email, permission,
      created_by: auth.user.userId, created_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await driveActivity({ business_id: businessId, folder_id: params.id, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'shared', details: { with: userId || email, permission }, request })
    return NextResponse.json({ share: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// DELETE /api/drive/folders/[id]/shares?share_id=
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  const shareId = new URL(request.url).searchParams.get('share_id')
  if (!shareId) return NextResponse.json({ error: 'share_id is required' }, { status: 400 })
  const { error } = await db.from('cloud_file_shares').delete().eq('id', shareId).eq('folder_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await driveActivity({ business_id: businessId, folder_id: params.id, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'share_revoked', details: { share_id: shareId }, request })
  return NextResponse.json({ ok: true })
}
