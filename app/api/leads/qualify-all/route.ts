import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: leads, error } = await db
      .from('leads')
      .select('*')
      .eq('status', 'new')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const leadList = leads || []
    const updated: Array<{ id: string; score: number; tier: string }> = []

    for (const lead of leadList) {
      const leadObj = lead as unknown as Record<string, unknown>
      let score = 50

      const phone = leadObj.phone as string
      const email = leadObj.email as string
      const company = leadObj.company as string
      const location = leadObj.location as string

      if (phone) score += 10
      if (email) score += 15
      if (company) score += 10
      if (location?.toLowerCase().includes('port harcourt')) score += 15
      if (leadObj.source === 'scraping') score += 5

      const tier = score >= 80 ? 'hot' : score >= 60 ? 'warm' : 'cold'

      await db
        .from('leads')
        .update({ score, tier })
        .eq('id', leadObj.id as string)

      updated.push({ id: leadObj.id as string, score, tier })
    }

    return NextResponse.json({
      message: `${updated.length} leads qualified`,
      qualified: updated
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
