import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: campaign, error } = await db
      .from('campaigns')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 404 })

    const campObj = campaign as unknown as Record<string, unknown>
    const stats = campObj.stats as Record<string, unknown> | null

    return NextResponse.json({
      campaign: campObj,
      analytics: stats || {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        responded: 0,
        failed: 0
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
