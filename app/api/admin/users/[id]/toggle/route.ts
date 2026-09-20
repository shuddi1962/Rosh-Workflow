import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = verifyToken(token)
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { data: user, error: fetchError } = await db
      .from('users')
      .select('is_active')
      .eq('id', params.id)
      .single()

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userObj = user as unknown as Record<string, unknown>
    const currentActive = userObj.is_active as boolean

    const { data, error } = await db
      .from('users')
      .update({ is_active: !currentActive })
      .eq('id', params.id)
      .select('id, email, full_name, is_active')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({
      message: `User ${!currentActive ? 'activated' : 'deactivated'}`,
      user: data
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
