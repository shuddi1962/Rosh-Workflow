import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, removeObject, addUsage, driveActivity, type Row } from '@/lib/drive/server'

const db = new DBClient()

function retentionDays(plan: Row): number {
  return Number(plan?.retention_days || 30)
}

// GET /api/drive/trash — trashed files + folders with auto-deletion dates
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const { data: toggle } = await db.from('feature_toggles').select('*').eq('feature_key', 'drive_trash_retention_days').single()
    const [filesRes, foldersRes, subsRes] = await Promise.all([
      db.from('cloud_files').select('*').eq('business_id', businessId).limit(2000),
      db.from('cloud_folders').select('*').eq('business_id', businessId).limit(1000),
      db.from('storage_subscriptions').select('*').eq('business_id', businessId).eq('status', 'active').limit(5),
    ])
    const sub = (((subsRes.data as unknown as Row[]) || [])[0]) || null
    let plan: Row = { retention_days: Number((toggle as unknown as Row | null)?.value && ((toggle as unknown as Row).value as Record<string, unknown>).days) || 30 }
    if (sub?.plan_id) {
      const { data } = await db.from('storage_plans').select('*').eq('id', String(sub.plan_id)).single()
      if (data) plan = data as unknown as Row
    }
    const days = retentionDays(plan)
    const withExpiry = (r: Row) => {
      const trashed = new Date(String(r.trashed_at))
      const auto = new Date(trashed.getTime() + days * 86400000)
      return { ...r, auto_delete_at: auto.toISOString() }
    }
    const files = (((filesRes.data as unknown as Row[]) || []).filter((f) => f.trashed_at).map(withExpiry))
    const folders = (((foldersRes.data as unknown as Row[]) || []).filter((f) => f.trashed_at).map(withExpiry))
    return NextResponse.json({ files, folders, retention_days: days })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/drive/trash/empty — permanently destroy everything in trash
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const { data } = await db.from('cloud_files').select('*').eq('business_id', businessId).limit(5000)
    const trashed = (((data as unknown as Row[]) || []).filter((f) => f.trashed_at))
    let freed = 0
    for (const f of trashed) {
      const { data: versions } = await db.from('cloud_file_versions').select('*').eq('file_id', String(f.id)).limit(200)
      const keys = new Set<string>([String(f.storage_key)])
      for (const v of ((versions as unknown as Row[]) || [])) keys.add(String(v.storage_key))
      for (const k of keys) { try { await removeObject(k) } catch { /* gone */ } }
      await db.from('cloud_file_versions').delete().eq('file_id', String(f.id))
      await db.from('cloud_file_shares').delete().eq('file_id', String(f.id))
      await db.from('cloud_share_links').delete().eq('file_id', String(f.id))
      await db.from('cloud_file_links').delete().eq('file_id', String(f.id))
      await db.from('cloud_file_activity').delete().eq('file_id', String(f.id))
      await db.from('cloud_files').delete().eq('id', String(f.id))
      freed += Number(f.size_bytes || 0)
    }
    const { data: tfolders } = await db.from('cloud_folders').select('*').eq('business_id', businessId).limit(1000)
    for (const fo of (((tfolders as unknown as Row[]) || []).filter((x) => x.trashed_at))) {
      await db.from('cloud_folders').delete().eq('id', String(fo.id))
    }
    if (freed > 0) await addUsage(businessId, -freed, -trashed.length)
    await driveActivity({ business_id: businessId, actor_user_id: auth.user.userId, actor_name: auth.user.name, action: 'trash_emptied', details: { files: trashed.length, freed_bytes: freed }, request })
    return NextResponse.json({ ok: true, destroyed: trashed.length, freed_bytes: freed })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
