import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: posts } = await db
      .from('social_posts')
      .select('status')

    const { data: leads } = await db
      .from('leads')
      .select('status')

    const { data: campaigns } = await db
      .from('campaigns')
      .select('status')

    const postList = posts || []
    const leadList = leads || []
    const campaignList = campaigns || []

    const totalPosts = postList.length
    const publishedPosts = postList.filter((p: Record<string, unknown>) => p.status === 'published').length
    const totalLeads = leadList.length
    const hotLeads = leadList.filter((l: Record<string, unknown>) => l.tier === 'hot').length
    const totalCampaigns = campaignList.length
    const activeCampaigns = campaignList.filter((c: Record<string, unknown>) => c.status === 'active').length

    return NextResponse.json({
      total_posts: totalPosts,
      published_posts: publishedPosts,
      total_leads: totalLeads,
      hot_leads: hotLeads,
      total_campaigns: totalCampaigns,
      active_campaigns: activeCampaigns,
      generated_at: new Date().toISOString()
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
