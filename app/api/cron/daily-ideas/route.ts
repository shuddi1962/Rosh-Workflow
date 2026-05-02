import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { generateDailyIdeas } from '@/lib/content/daily-generator'

const db = new DBClient()

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const isVercelCron = request.headers.get('x-vercel-cron')

  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const ideas = await generateDailyIdeas()

    const saved: any[] = []
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0)

    for (const idea of ideas) {
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
      if (error) console.error('Cron: Error saving idea:', error)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Generated ${saved.length} daily ideas`,
      count: saved.length
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
