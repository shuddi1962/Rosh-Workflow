import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth, audit } from '@/lib/operations/server'

const db = new DBClient()

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.user.role !== 'admin') return NextResponse.json({ error: 'Manager access required' }, { status: 403 })
  try {
    const body = (await request.json()) as Record<string, unknown>
    const action = String(body.action || 'save')
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const k of ['executive_summary', 'challenges', 'actions_taken', 'achievements', 'recommendations', 'next_month_plan']) {
      if (body[k] !== undefined) patch[k] = String(body[k])
    }
    if (action === 'approve') { patch.status = 'approved'; patch.reviewed_by = auth.user.name || auth.user.email; patch.reviewed_at = new Date().toISOString(); patch.review_comment = String(body.comment || '') }
    else if (action === 'return') {
      if (!body.comment) return NextResponse.json({ error: 'Return comment required' }, { status: 400 })
      patch.status = 'returned'; patch.reviewed_by = auth.user.name || auth.user.email; patch.reviewed_at = new Date().toISOString(); patch.review_comment = String(body.comment)
    }
    const { data, error } = await db.from('monthly_reports').update(patch).eq('id', params.id).select().single()
    if (error) throw new Error(error.message)
    await audit(auth.user.userId, `monthly_report.${action}`, 'monthly_report', params.id, {}, request)
    return NextResponse.json({ report: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
