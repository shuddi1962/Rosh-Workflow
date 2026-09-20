import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: trends, error } = await db
      .from('trends')
      .select('*')
      .order('momentum_score', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const trendList = trends || []
    const byDivision: Record<string, number> = {}
    const bySource: Record<string, number> = {}
    const avgScore = trendList.length > 0
      ? trendList.reduce((sum: number, t: Record<string, unknown>) => sum + (t.momentum_score as number || 0), 0) / trendList.length
      : 0

    for (const trend of trendList) {
      const t = trend as unknown as Record<string, unknown>
      const division = t.division_relevance as string
      const source = t.source as string
      byDivision[division] = (byDivision[division] || 0) + 1
      bySource[source] = (bySource[source] || 0) + 1
    }

    return NextResponse.json({
      trends: trendList,
      total: trendList.length,
      by_division: byDivision,
      by_source: bySource,
      average_score: avgScore.toFixed(0)
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
