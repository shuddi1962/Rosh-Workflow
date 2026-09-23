import { NextResponse } from 'next/server'
import { verifyToken, verifyPassword, hashPassword } from '@/lib/auth'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

function getToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.replace('Bearer ', '').trim()
  const cookie = request.headers.get('cookie')
  return cookie?.match(/access_token=([^;]+)/)?.[1] || null
}

export async function GET(request: Request) {
  try {
    const token = getToken(request)

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user: payload })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}

// PUT /api/auth/me — update own profile (full_name, email) or change
// password ({ current_password, new_password }).
export async function PUT(request: Request) {
  try {
    const token = getToken(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (await request.json()) as Record<string, unknown>

    // Password change flow
    if (body.current_password !== undefined || body.new_password !== undefined) {
      const current = String(body.current_password || '')
      const next = String(body.new_password || '')
      if (!current || !next) return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 })
      if (next.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })

      const { data: user, error } = await db.from('users').select('*').eq('id', payload.userId).single()
      if (error || !user) return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      const userObj = user as unknown as Record<string, unknown>
      const valid = await verifyPassword(current, String(userObj.password_hash || ''))
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })

      const { error: updateError } = await db
        .from('users')
        .update({ password_hash: await hashPassword(next) })
        .eq('id', payload.userId)
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
      return NextResponse.json({ ok: true, message: 'Password updated successfully' })
    }

    // Profile update flow
    const patch: Record<string, unknown> = {}
    if (body.full_name !== undefined) {
      const name = String(body.full_name).trim()
      if (!name) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
      patch.full_name = name
    }
    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase()
      if (!email || !email.includes('@')) return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
      patch.email = email
    }
    if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

    const { data, error } = await db
      .from('users')
      .update(patch)
      .eq('id', payload.userId)
      .select('id, email, full_name, role, department, staff_role, business_id')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ user: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
