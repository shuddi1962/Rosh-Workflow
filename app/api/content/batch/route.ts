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
      return NextResponse.json({ error: 'posts array is required' }, { status: 400 })
    }

    const postsToInsert = posts.map((post: Record<string, unknown>) => ({
      ...post,
      status: post.status || 'draft',
      auto_generated: post.auto_generated !== false,
      created_at: new Date().toISOString()
    }))

    const { data, error } = await db
      .from('social_posts')
      .insert(postsToInsert)
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: `${postsToInsert.length} posts created`, posts: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
