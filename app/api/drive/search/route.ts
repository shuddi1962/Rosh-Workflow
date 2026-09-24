import { NextResponse } from 'next/server'
import { getDBPool } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, categoryOf, type Row } from '@/lib/drive/server'

// GET /api/drive/search?q=&type=document|image|video|audio|archive|other&owner=&from=&to=&shared=&tag=
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    const type = url.searchParams.get('type') || ''
    const owner = url.searchParams.get('owner') || ''
    const from = url.searchParams.get('from') || ''
    const to = url.searchParams.get('to') || ''
    const shared = url.searchParams.get('shared') || ''
    const tag = url.searchParams.get('tag') || ''
    const sb = getDBPool().getClient()
    let query = sb.from('cloud_files').select('*').eq('business_id', businessId).is('trashed_at', null).limit(1000)
    if (q) query = query.ilike('name', `%${q}%`)
    if (owner) query = query.ilike('created_by_name', `%${owner}%`)
    if (from) query = query.gte('updated_at', new Date(from).toISOString())
    if (to) query = query.lte('updated_at', new Date(to).toISOString())
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    let rows = ((data as unknown as Row[]) || [])
    if (type) rows = rows.filter((f) => categoryOf(String(f.mime_type || ''), String(f.extension || '')) === type)
    if (tag) rows = rows.filter((f) => ((f.tags as string[]) || []).some((t) => String(t).toLowerCase().includes(tag.toLowerCase())))
    if (shared === 'yes' || shared === 'no') {
      const { data: shares } = await sb.from('cloud_file_shares').select('file_id').eq('business_id', businessId).limit(2000)
      const sharedIds = new Set((((shares as unknown as Row[]) || []).map((s) => String(s.file_id))))
      rows = rows.filter((f) => (shared === 'yes' ? sharedIds.has(String(f.id)) : !sharedIds.has(String(f.id))))
    }
    rows.sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
    return NextResponse.json({ files: rows.slice(0, 200), total: rows.length })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
