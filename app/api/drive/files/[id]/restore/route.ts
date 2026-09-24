import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, driveFileRow, filePermission, driveActivity } from '@/lib/drive/server'

const db = new DBClient()

// POST /api/drive/files/[id]/restore — restore from trash (to root if parent trashed)
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const file = await driveFileRow(businessId, params.id)
    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 })
    const perm = await filePermission(businessId, file, auth.user)
    if (perm !== 'owner' && perm !== 'editor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    let folderId = file.folder_id ? String(file.folder_id) : null
    if (folderId) {
      const { data: parent } = await db.from('cloud_folders').select('*').eq('id', folderId).eq('business_id', businessId).single()
      if (!parent || (parent as unknown as Record<string, unknown>).trashed_at) folderId = null
    }
    const { data, error } = await db.from('cloud_files').update({ trashed_at: null, trashed_by: '', folder_id: folderId, updated_at: new Date().toISOString() }).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await driveActivity({ business_id: businessId, file_id: params.id, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'restored', details: { name: String(file.name) }, request })
    return NextResponse.json({ file: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
