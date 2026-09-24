import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, driveFolderRow, driveActivity, type Row } from '@/lib/drive/server'

const db = new DBClient()

async function descendants(businessId: string, rootId: string): Promise<string[]> {
  const { data } = await db.from('cloud_folders').select('*').eq('business_id', businessId).limit(2000)
  const all = ((data as unknown as Row[]) || [])
  const out: string[] = []
  const walk = (pid: string) => {
    for (const f of all) {
      if (String(f.parent_id || '') === pid) {
        out.push(String(f.id))
        walk(String(f.id))
      }
    }
  }
  walk(rootId)
  return out
}

// PUT /api/drive/folders/[id] { name?, parent_id?, is_starred? }
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const folder = await driveFolderRow(businessId, params.id)
    if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    const body = (await request.json()) as Row
    const patch: Row = { updated_at: new Date().toISOString() }
    if (body.name !== undefined) {
      const name = String(body.name).trim().slice(0, 120)
      if (!name) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      patch.name = name
    }
    if (body.parent_id !== undefined) {
      const pid = body.parent_id ? String(body.parent_id) : null
      if (pid === params.id) return NextResponse.json({ error: 'A folder cannot contain itself' }, { status: 400 })
      if (pid) {
        const parent = await driveFolderRow(businessId, pid)
        if (!parent) return NextResponse.json({ error: 'Target folder not found' }, { status: 404 })
        const below = await descendants(businessId, params.id)
        if (below.includes(pid)) return NextResponse.json({ error: 'Cannot move a folder into its own subfolder' }, { status: 400 })
      }
      patch.parent_id = pid
    }
    if (body.is_starred !== undefined) patch.is_starred = Boolean(body.is_starred)
    const { data, error } = await db.from('cloud_folders').update(patch).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await driveActivity({ business_id: businessId, folder_id: params.id, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'updated', details: patch, request })
    return NextResponse.json({ folder: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// DELETE /api/drive/folders/[id] — move folder + contents to trash
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const folder = await driveFolderRow(businessId, params.id)
    if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    const now = new Date().toISOString()
    const ids = [params.id, ...(await descendants(businessId, params.id))]
    for (const fid of ids) {
      await db.from('cloud_folders').update({ trashed_at: now, updated_at: now }).eq('id', fid)
      await db.from('cloud_files').update({ trashed_at: now, trashed_by: auth.user.userId }).eq('folder_id', fid).eq('business_id', businessId)
    }
    await driveActivity({ business_id: businessId, folder_id: params.id, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'trashed', details: { name: String(folder.name) }, request })
    return NextResponse.json({ ok: true, trashed_folders: ids.length })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
