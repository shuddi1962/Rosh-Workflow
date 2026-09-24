import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/operations/server'
import { evaluateAutomation } from '@/lib/operations/automation'

// POST /api/automation/evaluate — run the operations automation engine on demand.
// Admin/manager only. Only creates notifications; approvals stay human.
export async function POST(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }
  try {
    const result = await evaluateAutomation()
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// GET /api/automation/evaluate — list rule catalog + status.
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { DBClient } = await import('@/lib/insforge/server')
    const db = new DBClient()
    const { data } = await db.from('automation_rules').select('*').order('rule_key', { ascending: true }).limit(50)
    return NextResponse.json({ rules: (data as unknown[]) || [] })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
