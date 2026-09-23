import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireRole, audit } from '@/lib/operations/server'
import { hashPassword } from '@/lib/auth'

const db = new DBClient()

// Admin: staff directory — users with department + staff role, plus business memberships.
export async function GET(request: Request) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  const { data: users, error } = await db.from('users').select('*').order('created_at', { ascending: false }).limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const { data: members } = await db.from('business_members').select('*').limit(2000)
  const { data: businesses } = await db.from('businesses').select('*').limit(200)
  const safe = ((users as unknown as Array<Record<string, unknown>>) || []).map((u) => {
    const { password_hash, ...rest } = u
    return rest
  })
  return NextResponse.json({
    staff: safe,
    memberships: (members as unknown[]) || [],
    businesses: (businesses as unknown[]) || [],
  })
}

// Admin: create staff (user + membership in one step)
export async function POST(request: Request) {
  const auth = requireRole(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const body = (await request.json()) as Record<string, unknown>
    const email = String(body.email || '').trim()
    const fullName = String(body.full_name || '').trim()
    const password = String(body.password || '')
    if (!email || !fullName || !password) return NextResponse.json({ error: 'email, full_name and password are required' }, { status: 400 })
    const department = String(body.department || 'administration')
    const staffRole = String(body.staff_role || 'viewer')
    const businessId = body.business_id ? String(body.business_id) : null

    const password_hash = await hashPassword(password)
    const { data, error } = await db.from('users').insert({
      email,
      password_hash,
      full_name: fullName,
      role: String(body.role || 'operator'),
      department,
      staff_role: staffRole,
      business_id: businessId,
      is_active: true,
      created_at: new Date().toISOString(),
    }).select('id, email, full_name, role, department, staff_role, business_id, is_active, created_at').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const created = data as unknown as Record<string, unknown>
    if (businessId) {
      await db.from('business_members').insert({
        business_id: businessId,
        user_id: String(created.id),
        user_email: email,
        user_name: fullName,
        department,
        staff_role: staffRole,
        is_active: true,
        invited_by: auth.user.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
    await audit(auth.user.userId, 'staff.create', 'user', String(created.id), { email, department, staffRole }, request)
    return NextResponse.json({ staff: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
