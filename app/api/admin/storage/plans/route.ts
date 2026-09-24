import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireRole, audit } from '@/lib/operations/server'
import { type Row } from '@/lib/drive/server'

const db = new DBClient()

// GET /api/admin/storage/plans — full catalog incl. inactive
export async function GET(request: Request) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  const { data } = await db.from('storage_plans').select('*').limit(30)
  return NextResponse.json({ plans: ((data as unknown as Row[]) || []) })
}

// POST /api/admin/storage/plans — create plan (admin only)
export async function POST(request: Request) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Row
    const name = String(body.name || '').trim()
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    const row = {
      name, rank: Number(body.rank ?? 0),
      capacity_bytes: Number(body.capacity_bytes || 5368709120),
      price_monthly_ngn: Number(body.price_monthly_ngn || 0),
      price_annual_ngn: Number(body.price_annual_ngn || 0),
      currency: String(body.currency || 'NGN'),
      max_file_bytes: Number(body.max_file_bytes || 104857600),
      max_users: Number(body.max_users || 3),
      retention_days: Number(body.retention_days || 30),
      features: Array.isArray(body.features) ? body.features : [],
      is_active: body.is_active !== false,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    const { data, error } = await db.from('storage_plans').insert(row).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await audit(auth.user.userId, 'storage.plan_created', 'storage_plan', String((data as unknown as Row).id), { name }, request)
    return NextResponse.json({ plan: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
