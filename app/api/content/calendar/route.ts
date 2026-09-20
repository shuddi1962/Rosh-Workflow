import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = db.from('social_posts').select('*').order('scheduled_at', { ascending: true })

    if (startDate && endDate) {
      const posts = await db
        .from('social_posts')
        .select('*')
        .order('scheduled_at', { ascending: true })

      const filtered = (posts.data || []).filter((post: Record<string, unknown>) => {
        const scheduledAt = post.scheduled_at as string
        return scheduledAt && scheduledAt >= startDate && scheduledAt <= endDate
      })

      return NextResponse.json({ calendar: filtered })
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ calendar: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
