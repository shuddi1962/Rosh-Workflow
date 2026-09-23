import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireRole, audit } from '@/lib/operations/server'

const db = new DBClient()

// Admin: reassign staff department / role / business — PUT /api/admin/staff/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const patch: Record<string, unknown> = {}
    for (const k of ['department', 'staff_role', 'business_id', 'role', 'is_active', 'full_name']) {
      if (body[k] !== undefined) patch[k] = body[k]
    }
    if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    const { data, error } = await db.from('users').update(patch).eq('id', params.id).select('id, email, full_name, role, department, staff_role, business_id, is_active, created_at').single()
    if (error) throw new Error(error.message)
    const updated = data as unknown as Record<string, unknown>
    // keep membership in sync when business/department/role changes
    if (body.business_id !== undefined || body.department !== undefined || body.staff_role !== undefined) {
      const businessId = String(body.business_id ?? updated.business_id ?? '')
      if (businessId) {
        const { data: existing } = await db.from('business_members').select('*').eq('business_id', businessId).eq('user_id', params.id).single()
        const memberPatch = {
          department: String(body.department ?? updated.department ?? 'administration'),
          staff_role: String(body.staff_role ?? updated.staff_role ?? 'viewer'),
          user_email: String(updated.email || ''),
          user_name: String(updated.full_name || ''),
          is_active: updated.is_active !== false,
          updated_at: new Date().toISOString(),
        }
        if (existing) {
          await db.from('business_members').update(memberPatch).eq('business_id', businessId).eq('user_id', params.id)
        } else {
          await db.from('business_members').insert({ business_id: businessId, user_id: params.id, invited_by: auth.user.userId, created_at: new Date().toISOString(), ...memberPatch })
        }
      }
    }
    await audit(auth.user.userId, 'staff.assign', 'user', params.id, { fields: Object.keys(patch) }, request)
    return NextResponse.json({ staff: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
