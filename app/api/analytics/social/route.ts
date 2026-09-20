import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: posts, error } = await db
      .from('social_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const postList = posts || []
    const platformBreakdown: Record<string, { total: number; published: number; engagement: number }> = {}

    for (const post of postList) {
      const p = post as unknown as Record<string, unknown>
      const platform = p.platform as string
      const engagement = p.engagement as Record<string, number> | null

      if (!platformBreakdown[platform]) {
        platformBreakdown[platform] = { total: 0, published: 0, engagement: 0 }
      }

      platformBreakdown[platform].total += 1
      if (p.status === 'published') platformBreakdown[platform].published += 1

      if (engagement) {
        platformBreakdown[platform].engagement += (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0)
      }
    }

    const topPosts = postList
      .filter((p: Record<string, unknown>) => p.status === 'published')
      .map((p: Record<string, unknown>) => {
        const engagement = p.engagement as Record<string, number> | null
        const totalEngagement = engagement ? (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0) : 0
        return { ...p, total_engagement: totalEngagement }
      })
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.total_engagement as number) - (a.total_engagement as number))
      .slice(0, 10)

    return NextResponse.json({
      platform_breakdown: platformBreakdown,
      top_posts: topPosts,
      total_posts: postList.length
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
