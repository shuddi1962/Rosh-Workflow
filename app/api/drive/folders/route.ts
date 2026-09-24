import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, driveActivity, type Row } from '@/lib/drive/server'

const db = new DBClient()

// GET /api/drive/folders?parent=<id|root>&trashed=1 — list folders
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const url = new URL(request.url)
    const parent = url.searchParams.get('parent')
    const trashed = url.searchParams.get('trashed') === '1'
    const { data, error } = await db.from('cloud_folders').select('*').eq('business_id', businessId).limit(1000)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    let rows = ((data as unknown as Row[]) || []).filter((f) => (trashed ? !!f.trashed_at : !f.trashed_at))
    if (!trashed && parent !== 'all') {
      rows = rows.filter((f) => (parent === 'root' || parent === null || parent === '' ? !f.parent_id : String(f.parent_id) === parent))
    }
    rows.sort((a, b) => String(a.name).localeCompare(String(b.name)))
    return NextResponse.json({ folders: rows })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/drive/folders { name, parent_id? } — create folder
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const body = (await request.json()) as Row
    const name = String(body.name || '').trim().slice(0, 120)
    if (!name) return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
    const parentId = body.parent_id ? String(body.parent_id) : null
    if (parentId) {
      const { data: parent } = await db.from('cloud_folders').select('*').eq('id', parentId).eq('business_id', businessId).single()
      if (!parent) return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 })
      if ((parent as unknown as Row).trashed_at) return NextResponse.json({ error: 'Parent folder is in trash' }, { status: 400 })
    }
    const { data: dup } = await db.from('cloud_folders').select('*').eq('business_id', businessId).limit(1000)
    const clash = ((dup as unknown as Row[]) || []).find(
      (f) => !f.trashed_at && String(f.parent_id || '') === String(parentId || '') && String(f.name).toLowerCase() === name.toLowerCase()
    )
    if (clash) return NextResponse.json({ error: 'A folder with this name already exists here' }, { status: 409 })
    const { data, error } = await db.from('cloud_folders').insert({
      business_id: businessId, parent_id: parentId, name,
      created_by: auth.user.userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await driveActivity({ business_id: businessId, folder_id: String((data as unknown as Row).id), actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'created', details: { name }, request })
    return NextResponse.json({ folder: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
