import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: campaigns, error } = await db
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const campList = campaigns || []
    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    const byDivision: Record<string, number> = {}

    for (const camp of campList) {
      const c = camp as unknown as Record<string, unknown>
      const type = c.type as string
      const status = c.status as string
      const division = c.division as string

      byType[type] = (byType[type] || 0) + 1
      byStatus[status] = (byStatus[status] || 0) + 1
      byDivision[division] = (byDivision[division] || 0) + 1
    }

    return NextResponse.json({
      campaigns: campList,
      by_type: byType,
      by_status: byStatus,
      by_division: byDivision
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
