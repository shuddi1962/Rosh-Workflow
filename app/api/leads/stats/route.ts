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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const leadList = leads || []
    const total = leadList.length

    const byStatus: Record<string, number> = {}
    const byTier: Record<string, number> = {}
    const byDivision: Record<string, number> = {}
    const bySource: Record<string, number> = {}

    for (const lead of leadList) {
      const l = lead as unknown as Record<string, unknown>
      const status = l.status as string
      const tier = l.tier as string
      const division = l.division_interest as string
      const source = l.source as string

      byStatus[status] = (byStatus[status] || 0) + 1
      byTier[tier] = (byTier[tier] || 0) + 1
      byDivision[division] = (byDivision[division] || 0) + 1
      bySource[source] = (bySource[source] || 0) + 1
    }

    const hotLeads = leadList.filter((l: Record<string, unknown>) => l.tier === 'hot').length
    const newLeads = leadList.filter((l: Record<string, unknown>) => l.status === 'new').length
    const customers = leadList.filter((l: Record<string, unknown>) => l.status === 'customer').length

    return NextResponse.json({
      total,
      by_status: byStatus,
      by_tier: byTier,
      by_division: byDivision,
      by_source: bySource,
      hot_leads: hotLeads,
      new_leads: newLeads,
      customers
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
