import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, driveFileRow, filePermission, driveActivity, type Row } from '@/lib/drive/server'

const db = new DBClient()

// GET /api/drive/links?entity_type=&entity_id= — files attached to a business record
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  const url = new URL(request.url)
  const entityType = url.searchParams.get('entity_type') || ''
  const entityId = url.searchParams.get('entity_id') || ''
  if (!entityType || !entityId) return NextResponse.json({ error: 'entity_type and entity_id are required' }, { status: 400 })
  const { data } = await db.from('cloud_file_links').select('*').eq('business_id', businessId).eq('entity_type', entityType).eq('entity_id', entityId).limit(200)
  const out: Row[] = []
  for (const l of ((data as unknown as Row[]) || [])) {
    const f = await driveFileRow(businessId, String(l.file_id))
    if (f && !f.trashed_at) out.push({ ...f, link_id: String(l.id) })
  }
  return NextResponse.json({ files: out })
}

// POST /api/drive/links { file_id, entity_type, entity_id } — attach (no duplication)
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const body = (await request.json()) as Row
    const fileId = String(body.file_id || '')
    const entityType = String(body.entity_type || '').slice(0, 60)
    const entityId = String(body.entity_id || '').slice(0, 120)
    if (!fileId || !entityType || !entityId) return NextResponse.json({ error: 'file_id, entity_type and entity_id are required' }, { status: 400 })
    const file = await driveFileRow(businessId, fileId)
    if (!file || file.trashed_at) return NextResponse.json({ error: 'File not found' }, { status: 404 })
    const perm = await filePermission(businessId, file, auth.user)
    if (perm !== 'owner' && perm !== 'editor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { data, error } = await db.from('cloud_file_links').insert({
      business_id: businessId, file_id: fileId, entity_type: entityType, entity_id: entityId,
      created_by: auth.user.userId, created_at: new Date().toISOString(),
    }).select().single()
    if (error) {
      if (error.message.includes('duplicate') || error.code === '23505') return NextResponse.json({ error: 'Already attached' }, { status: 409 })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    await driveActivity({ business_id: businessId, file_id: fileId, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'attached', details: { entity_type: entityType, entity_id: entityId }, request })
    return NextResponse.json({ link: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// DELETE /api/drive/links?link_id= — detach (file itself is untouched)
export async function DELETE(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  const linkId = new URL(request.url).searchParams.get('link_id')
  if (!linkId) return NextResponse.json({ error: 'link_id is required' }, { status: 400 })
  const { data: link } = await db.from('cloud_file_links').select('*').eq('id', linkId).eq('business_id', businessId).single()
  if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  await db.from('cloud_file_links').delete().eq('id', linkId)
  await driveActivity({ business_id: businessId, file_id: String((link as unknown as Row).file_id), actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'detached', details: { link_id: linkId } })
  return NextResponse.json({ ok: true })
}
