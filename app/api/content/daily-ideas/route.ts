import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'
import { generateDailyIdeas } from '@/lib/content/daily-generator'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ideas = await generateDailyIdeas()

    const saved: any[] = []
    for (const idea of ideas) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0)
      const scheduledTime = new Date(today.getTime() + (saved.length * 2 * 60 * 60 * 1000))

      const { data, error } = await db
        .from('social_posts')
        .insert({
          division: idea.division,
          post_type: idea.post_type,
          platform: idea.platform,
          caption: idea.caption,
          hashtags: idea.hashtags,
          cta: idea.cta,
          status: 'draft',
          auto_generated: true,
          trend_keyword: idea.trend_keyword,
          trend_source: idea.trend_source,
          urgency: idea.urgency,
          image_prompt: idea.image_prompt,
          scheduled_at: scheduledTime.toISOString(),
          created_at: now.toISOString()
        })
        .select()
        .single()

      if (data) saved.push(data)
      if (error) console.error('Error saving idea:', error)
    }

    return NextResponse.json({ 
      success: true, 
      count: saved.length,
      ideas: saved
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
