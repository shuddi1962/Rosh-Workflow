import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, type Row } from '@/lib/drive/server'

const db = new DBClient()

// GET /api/drive/recent?limit= — recently opened / uploaded / modified (real data)
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const limit = Math.min(100, Math.max(1, Number(new URL(request.url).searchParams.get('limit') || 30)))
    const [filesRes, actRes] = await Promise.all([
      db.from('cloud_files').select('*').eq('business_id', businessId).limit(2000),
      db.from('cloud_file_activity').select('*').eq('business_id', businessId).limit(200),
    ])
    const files = (((filesRes.data as unknown as Row[]) || []).filter((f) => !f.trashed_at))
    const byId = new Map(files.map((f) => [String(f.id), f]))
    const recent = [...files].sort((a, b) => {
      const at = String(b.last_opened_at || b.updated_at || b.created_at || '')
      const bt = String(a.last_opened_at || a.updated_at || a.created_at || '')
      return at.localeCompare(bt)
    }).slice(0, limit)
    const activity = (((actRes.data as unknown as Row[]) || []).sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))).slice(0, 20))
      .map((a) => {
        const f = a.file_id ? byId.get(String(a.file_id)) : undefined
        return { ...a, file_name: f ? String(f.name) : undefined }
      })
    return NextResponse.json({ recent, activity })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
