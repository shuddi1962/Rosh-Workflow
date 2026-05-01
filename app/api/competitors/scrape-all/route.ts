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

    const { data: competitors, error } = await db
      .from('competitors')
      .select('id, name')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (!competitors || competitors.length === 0) {
      return NextResponse.json({ message: 'No competitors configured' })
    }

    const now = new Date().toISOString()
    await db
      .from('competitors')
      .update({ last_scanned: now })

    return NextResponse.json({
      message: `Scrape initiated for ${competitors.length} competitors`,
      count: competitors.length,
      competitors
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
