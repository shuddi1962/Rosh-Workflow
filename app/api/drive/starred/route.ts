import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, type Row } from '@/lib/drive/server'

const db = new DBClient()

// GET /api/drive/starred — starred files + folders
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const [filesRes, foldersRes] = await Promise.all([
      db.from('cloud_files').select('*').eq('business_id', businessId).limit(2000),
      db.from('cloud_folders').select('*').eq('business_id', businessId).limit(1000),
    ])
    const files = (((filesRes.data as unknown as Row[]) || []).filter((f) => f.is_starred && !f.trashed_at))
    const folders = (((foldersRes.data as unknown as Row[]) || []).filter((f) => f.is_starred && !f.trashed_at))
    return NextResponse.json({ files, folders })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
