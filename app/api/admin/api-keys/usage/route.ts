import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { resetDailyUsage } from '@/lib/env'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

function requireAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null
  const user = verifyToken(token)
  if (!user || user.role !== 'admin') return null
  return user
}

export async function GET(request: Request) {
  try {
    const user = requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { data, error } = await db
      .from('api_keys')
      .select('id, service, key_name, usage_today, usage_all_time, updated_at')
      .order('usage_today', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const response = NextResponse.json({ keys: data || [] })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = requireAdmin(request)
    if (!user) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const result = await resetDailyUsage()

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to reset daily usage' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Daily usage reset successfully', resetAt: new Date().toISOString() })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
