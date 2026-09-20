import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: leads, error } = await db
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const leadList = leads || []
    const conversionRate = leadList.length > 0
      ? (leadList.filter((l: Record<string, unknown>) => l.status === 'customer').length / leadList.length) * 100
      : 0

    const avgScore = leadList.length > 0
      ? leadList.reduce((sum: number, l: Record<string, unknown>) => sum + (l.score as number || 0), 0) / leadList.length
      : 0

    return NextResponse.json({
      leads: leadList,
      total: leadList.length,
      conversion_rate: conversionRate.toFixed(1),
      average_score: avgScore.toFixed(0)
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
