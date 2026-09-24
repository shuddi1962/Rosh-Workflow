import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireRole } from '@/lib/operations/server'
import { type Row } from '@/lib/drive/server'

const db = new DBClient()

// GET /api/admin/storage — workspace usage overview + totals (admin only)
export async function GET(request: Request) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const [bizRes, usageRes, subsRes, plansRes, txRes] = await Promise.all([
      db.from('businesses').select('*').limit(500),
      db.from('storage_usage').select('*').limit(1000),
      db.from('storage_subscriptions').select('*').limit(2000),
      db.from('storage_plans').select('*').limit(20),
      db.from('storage_transactions').select('*').limit(200),
    ])
    const businesses = ((bizRes.data as unknown as Row[]) || [])
    const usage = new Map((((usageRes.data as unknown as Row[]) || []).map((u) => [String(u.business_id), u])))
    const subsByBiz = new Map<string, Row[]>()
    for (const s of ((subsRes.data as unknown as Row[]) || [])) {
      const k = String(s.business_id)
      if (!subsByBiz.has(k)) subsByBiz.set(k, [])
      subsByBiz.get(k)?.push(s)
    }
    const workspaces = businesses.map((b) => {
      const u = usage.get(String(b.id))
      const active = (subsByBiz.get(String(b.id)) || []).find((s) => String(s.status) === 'active') || null
      return {
        id: b.id, name: b.name, slug: b.slug, email: b.email, status: b.status,
        used_bytes: Number(u?.used_bytes || 0), file_count: Number(u?.file_count || 0),
        plan_name: active ? String(active.plan_name) : 'Free',
        capacity_bytes: Number(active?.capacity_bytes || 5368709120),
        renews_at: active?.renews_at || null,
      }
    })
    const totalUsed = workspaces.reduce((s, w) => s + w.used_bytes, 0)
    const totalCapacity = workspaces.reduce((s, w) => s + w.capacity_bytes, 0)
    const txs = (((txRes.data as unknown as Row[]) || []).sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))).slice(0, 50))
    return NextResponse.json({
      totals: { workspaces: workspaces.length, used_bytes: totalUsed, capacity_bytes: totalCapacity },
      workspaces: workspaces.sort((a, b) => b.used_bytes - a.used_bytes),
      plans: ((plansRes.data as unknown as Row[]) || []),
      transactions: txs,
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
