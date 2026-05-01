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
      .select('date, ai_cost_usd')
      .order('date', { ascending: false })
      .limit(30)

    const analyticsList = analytics || []
    const totalCost = analyticsList.reduce((sum: number, a: Record<string, unknown>) => sum + (a.ai_cost_usd as number || 0), 0)
    const avgDailyCost = analyticsList.length > 0 ? totalCost / analyticsList.length : 0

    return NextResponse.json({
      total_ai_cost_usd: totalCost.toFixed(2),
      average_daily_cost_usd: avgDailyCost.toFixed(2),
      daily_breakdown: analyticsList
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
