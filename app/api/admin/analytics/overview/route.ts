import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { data: analytics } = await db
      .from('analytics_daily')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)

    const { data: posts } = await db.from('social_posts').select('id')
    const { data: leads } = await db.from('leads').select('id')
    const { data: campaigns } = await db.from('campaigns').select('id')
    const { data: users } = await db.from('users').select('id')
    const { data: apiKeys } = await db.from('api_keys').select('is_active')

    const totalApiCalls = (apiKeys || []).reduce((sum: number, k: Record<string, unknown>) => sum + (k.is_active ? 1 : 0), 0)

    return NextResponse.json({
      total_posts: (posts || []).length,
      total_leads: (leads || []).length,
      total_campaigns: (campaigns || []).length,
      total_users: (users || []).length,
      active_api_keys: totalApiCalls,
      recent_analytics: analytics || []
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
