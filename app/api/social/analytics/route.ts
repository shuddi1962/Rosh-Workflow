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
    const platform = searchParams.get('platform')

    let query = db.from('social_posts').select('*')

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data: posts, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const postList = posts || []
    const totalPosts = postList.length
    const published = postList.filter((p: Record<string, unknown>) => p.status === 'published').length
    const scheduled = postList.filter((p: Record<string, unknown>) => p.status === 'scheduled').length
    const draft = postList.filter((p: Record<string, unknown>) => p.status === 'draft').length

    const platformBreakdown: Record<string, number> = {}
    for (const post of postList) {
      const p = post as unknown as Record<string, unknown>
      const plat = p.platform as string
      platformBreakdown[plat] = (platformBreakdown[plat] || 0) + 1
    }

    let totalEngagement = 0
    for (const post of postList) {
      const p = post as unknown as Record<string, unknown>
      const engagement = p.engagement as Record<string, number> | null
      if (engagement) {
        totalEngagement += (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0)
      }
    }

    return NextResponse.json({
      total_posts: totalPosts,
      published,
      scheduled,
      draft,
      platform_breakdown: platformBreakdown,
      total_engagement: totalEngagement,
      average_engagement: published > 0 ? totalEngagement / published : 0
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
