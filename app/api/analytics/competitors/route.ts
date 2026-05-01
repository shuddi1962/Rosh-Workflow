import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: competitors, error } = await db
      .from('competitors')
      .select('*')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const compList = competitors || []
    const byDivision: Record<string, number> = {}

    for (const comp of compList) {
      const c = comp as unknown as Record<string, unknown>
      const division = c.division as string
      byDivision[division] = (byDivision[division] || 0) + 1
    }

    return NextResponse.json({
      competitors: compList,
      total: compList.length,
      by_division: byDivision
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
