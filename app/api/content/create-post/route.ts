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

    const body = await request.json()
    const { idea_id, caption, platforms, scheduled_at, auto_publish = false } = body

    if (!idea_id || !platforms || !Array.isArray(platforms)) {
      return NextResponse.json({ error: 'idea_id and platforms array are required' }, { status: 400 })
    }

    const { data: idea, error: ideaError } = await db
      .from('social_posts')
      .select('*')
      .eq('id', idea_id)
      .single()

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    const ideaData = idea as any

    const now = new Date().toISOString()
    const posts: any[] = []

    for (const platform of platforms) {
      const { data, error } = await db
        .from('social_posts')
        .insert({
          division: ideaData.division,
          post_type: ideaData.post_type,
          platform,
          caption: caption || ideaData.caption,
          hashtags: ideaData.hashtags,
          cta: ideaData.cta,
          status: scheduled_at ? 'scheduled' : auto_publish ? 'publishing' : 'draft',
          scheduled_at: scheduled_at || null,
          image_url: ideaData.image_url || null,
          image_prompt: ideaData.image_prompt || null,
          auto_generated: false,
          created_at: now,
          source_idea_id: idea_id
        })
        .select()
        .single()

      if (data) posts.push(data)
      if (error) console.error('Error creating post:', error)
    }

    if (ideaData.status === 'draft') {
      await db
        .from('social_posts')
        .update({ status: 'approved' })
        .eq('id', idea_id)
    }

    return NextResponse.json({
      success: true,
      count: posts.length,
      posts
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
