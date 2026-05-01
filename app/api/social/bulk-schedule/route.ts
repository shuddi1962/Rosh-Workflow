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

    const { posts } = await request.json()

    if (!posts || !Array.isArray(posts)) {
      return NextResponse.json({ error: 'posts array with id and scheduled_at is required' }, { status: 400 })
    }

    const results = []

    for (const item of posts) {
      if (!item.id || !item.scheduled_at) continue

      const { data, error } = await db
        .from('social_posts')
        .update({ status: 'scheduled', scheduled_at: item.scheduled_at })
        .eq('id', item.id)
        .select()
        .single()

      if (!error && data) {
        results.push(data)
      }
    }

    return NextResponse.json({
      message: `${results.length} posts scheduled`,
      scheduled: results
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
