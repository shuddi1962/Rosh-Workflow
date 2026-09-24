import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireRole, audit } from '@/lib/operations/server'
import { type Row } from '@/lib/drive/server'

const db = new DBClient()
const EDITABLE = ['rank', 'capacity_bytes', 'price_monthly_ngn', 'price_annual_ngn', 'currency', 'max_file_bytes', 'max_users', 'retention_days', 'features', 'is_active']

// PUT /api/admin/storage/plans/[id] — edit pricing/capacity/limits
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Row
    const patch: Row = { updated_at: new Date().toISOString() }
    for (const k of EDITABLE) if (body[k] !== undefined) patch[k] = body[k]
    if (body.name !== undefined) patch.name = String(body.name)
    const { data, error } = await db.from('storage_plans').update(patch).eq('id', params.id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await audit(auth.user.userId, 'storage.plan_updated', 'storage_plan', params.id, patch, request)
    return NextResponse.json({ plan: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

// DELETE /api/admin/storage/plans/[id] — deactivate (never hard-delete billing history)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  await db.from('storage_plans').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', params.id)
  await audit(auth.user.userId, 'storage.plan_deactivated', 'storage_plan', params.id, {}, request)
  return NextResponse.json({ ok: true })
}
