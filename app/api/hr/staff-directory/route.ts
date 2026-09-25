import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { requireAuth } from '@/lib/operations/server'

const db = new DBClient()

// GET /api/hr/staff-directory — permission-safe staff list (no password hashes,
// no tokens). Operators can see the directory; user administration stays admin-only.
export async function GET(request: Request) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { data, error } = await db
      .from('users')
      .select('id, email, full_name, role, department, staff_role, business_id, is_active, created_at, last_login')
      .order('full_name', { ascending: true })
      .limit(500)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const rows = ((data as unknown as Array<Record<string, unknown>>) || []).filter(
      (u) => u.is_active !== false
    )
    const { data: members } = await db.from('business_members').select('user_id, business_id, user_name').limit(2000)
    return NextResponse.json({
      staff: rows,
      memberships: (members as unknown[]) || [],
      count: rows.length,
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
