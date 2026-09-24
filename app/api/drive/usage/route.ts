import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'
import { resolveBusinessId, getStorageContext, maybeWarnQuota, categoryOf, formatBytes, type Row } from '@/lib/drive/server'

const db = new DBClient()

// GET /api/drive/usage — real quota, breakdown, largest files, growth
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  const businessId = await resolveBusinessId(auth.user)
  if (!businessId) return NextResponse.json({ error: 'No workspace found' }, { status: 400 })
  try {
    const ctx = await getStorageContext(businessId)
    await maybeWarnQuota(businessId, ctx, auth.user.userId)
    const { data, error } = await db.from('cloud_files').select('*').eq('business_id', businessId).limit(10000)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const files = ((data as unknown as Row[]) || [])
    const live = files.filter((f) => !f.trashed_at)
    const trashedBytes = files.filter((f) => f.trashed_at).reduce((s, f) => s + Number(f.size_bytes || 0), 0)
    const byCategory: Record<string, { bytes: number; count: number }> = { document: { bytes: 0, count: 0 }, image: { bytes: 0, count: 0 }, video: { bytes: 0, count: 0 }, audio: { bytes: 0, count: 0 }, archive: { bytes: 0, count: 0 }, other: { bytes: 0, count: 0 } }
    for (const f of live) {
      const c = categoryOf(String(f.mime_type || ''), String(f.extension || ''))
      byCategory[c].bytes += Number(f.size_bytes || 0)
      byCategory[c].count += 1
    }
    const largest = [...live].sort((a, b) => Number(b.size_bytes || 0) - Number(a.size_bytes || 0)).slice(0, 10)
      .map((f) => ({ id: f.id, name: f.name, size_bytes: f.size_bytes, mime_type: f.mime_type }))
    const byType: Record<string, number> = {}
    for (const f of live) {
      const k = String(f.extension || 'file').toLowerCase()
      byType[k] = (byType[k] || 0) + 1
    }
    const topTypes = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 8)
    const day = 86400000
    const now = Date.now()
    const uploaded7d = live.filter((f) => now - new Date(String(f.created_at)).getTime() < 7 * day).reduce((s, f) => s + Number(f.size_bytes || 0), 0)
    const quota = Number(ctx.plan.capacity_bytes || 0)
    const pct = quota ? Math.round((ctx.used_bytes / quota) * 100) : 0
    return NextResponse.json({
      plan: { name: ctx.plan.name, capacity_bytes: quota, max_file_bytes: ctx.plan.max_file_bytes, retention_days: ctx.plan.retention_days },
      subscription: ctx.subscription,
      used_bytes: ctx.used_bytes,
      used_display: formatBytes(ctx.used_bytes),
      quota_display: formatBytes(quota),
      remaining_bytes: Math.max(0, quota - ctx.used_bytes),
      percent_used: pct,
      file_count: live.length,
      folder_count: 0,
      trash_bytes: trashedBytes,
      trash_display: formatBytes(trashedBytes),
      breakdown: byCategory,
      largest,
      top_types: topTypes,
      uploaded_last_7d: uploaded7d,
      uploaded_last_7d_display: formatBytes(uploaded7d),
      warning: pct >= 100 ? 'full' : pct >= 90 ? 'critical' : pct >= 80 ? 'warning' : 'ok',
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
