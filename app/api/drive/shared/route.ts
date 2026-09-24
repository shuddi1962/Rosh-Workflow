import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, driveFileRow, type Row } from '@/lib/drive/server'

const db = new DBClient()

// GET /api/drive/shared — files shared WITH me + files/folders shared BY me
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const { data, error } = await db.from('cloud_file_shares').select('*').eq('business_id', businessId).limit(2000)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const shares = ((data as unknown as Row[]) || [])
    const email = (auth.user.email || '').toLowerCase()
    const withMe = shares.filter((s) => String(s.shared_with_user_id || '') === auth.user.userId || (email && String(s.shared_with_email || '').toLowerCase() === email))
    const byMe = shares.filter((s) => String(s.created_by || '') === auth.user.userId)
    const withMeFiles: Row[] = []
    for (const s of withMe) {
      if (!s.file_id) continue
      const f = await driveFileRow(businessId, String(s.file_id))
      if (f && !f.trashed_at) withMeFiles.push({ ...f, share_permission: String(s.permission || 'viewer') })
    }
    const { data: folders } = await db.from('cloud_folders').select('*').eq('business_id', businessId).limit(2000)
    const folderMap = new Map((((folders as unknown as Row[]) || []).map((f) => [String(f.id), f])))
    const withMeFolders = withMe.filter((s) => s.folder_id && folderMap.has(String(s.folder_id)) && !folderMap.get(String(s.folder_id))?.trashed_at)
      .map((s) => ({ ...folderMap.get(String(s.folder_id)) as Row, share_permission: String(s.permission || 'viewer') }))
    return NextResponse.json({ shared_with_me: withMeFiles, shared_folders: withMeFolders, shared_by_me: byMe })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
