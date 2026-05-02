import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export interface WeeklyReport {
  period: string
  summary: {
    total_leads: number
    new_leads: number
    qualified_leads: number
    campaigns_sent: number
    posts_published: number
    calls_made: number
    revenue_pipeline_ngn: number
  }
  top_performers: {
    best_campaign: string
    best_post_type: string
    best_channel: string
    best_day: string
  }
  division_breakdown: {
    marine: { leads: number; campaigns: number; posts: number }
    tech: { leads: number; campaigns: number; posts: number }
  }
  recommendations: string[]
  generated_at: string
}

export async function generateWeeklyReport(): Promise<WeeklyReport> {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const period = `${weekAgo.toLocaleDateString()} - ${now.toLocaleDateString()}`

  const { data: leads } = await db
    .from('leads')
    .select('id, division_interest, stage, score, created_at')

  const { data: campaigns } = await db
    .from('campaigns')
    .select('id, division, type, stats, created_at')

  const { data: posts } = await db
    .from('social_posts')
    .select('id, division, platform, post_type, engagement, created_at')

  const { data: calls } = await db
    .from('call_logs')
    .select('id, duration_seconds, status, started_at')

  const leadsArray = (leads as unknown[] | null) || []
  const campaignsArray = (campaigns as unknown[] | null) || []
  const postsArray = (posts as unknown[] | null) || []
  const callsArray = (calls as unknown[] | null) || []

  const thisWeekLeads = leadsArray.filter((l: unknown) => {
    const lead = l as Record<string, unknown>
    return new Date(lead.created_at as string) >= weekAgo
  })

  const thisWeekCampaigns = campaignsArray.filter((c: unknown) => {
    const camp = c as Record<string, unknown>
    return new Date(camp.created_at as string) >= weekAgo
  })

  const thisWeekPosts = postsArray.filter((p: unknown) => {
    const post = p as Record<string, unknown>
    return new Date(post.created_at as string) >= weekAgo
  })

  const thisWeekCalls = callsArray.filter((c: unknown) => {
    const call = c as Record<string, unknown>
    return new Date(call.started_at as string) >= weekAgo
  })

  const qualifiedLeads = thisWeekLeads.filter((l: unknown) => {
    const lead = l as Record<string, unknown>
    return lead.qualification_status === 'qualified'
  })

  const marineLeads = thisWeekLeads.filter((l: unknown) => {
    const lead = l as Record<string, unknown>
    return lead.division_interest === 'marine' || lead.division_interest === 'both'
  })
  const techLeads = thisWeekLeads.filter((l: unknown) => {
    const lead = l as Record<string, unknown>
    return lead.division_interest === 'tech' || lead.division_interest === 'both'
  })

  const marineCampaigns = thisWeekCampaigns.filter((c: unknown) => {
    const camp = c as Record<string, unknown>
    return camp.division === 'marine' || camp.division === 'both'
  })
  const techCampaigns = thisWeekCampaigns.filter((c: unknown) => {
    const camp = c as Record<string, unknown>
    return camp.division === 'tech' || camp.division === 'both'
  })

  const marinePosts = thisWeekPosts.filter((p: unknown) => {
    const post = p as Record<string, unknown>
    return post.division === 'marine'
  })
  const techPosts = thisWeekPosts.filter((p: unknown) => {
    const post = p as Record<string, unknown>
    return post.division === 'tech'
  })

  const avgScore = thisWeekLeads.length > 0
    ? thisWeekLeads.reduce((sum: number, l: unknown) => sum + ((l as Record<string, unknown>).score as number || 0), 0) / thisWeekLeads.length
    : 0

  const recommendations = generateRecommendations({
    leadsCount: thisWeekLeads.length,
    qualifiedCount: qualifiedLeads.length,
    campaignsCount: thisWeekCampaigns.length,
    postsCount: thisWeekPosts.length,
    callsCount: thisWeekCalls.length,
    avgScore,
    marineRatio: marineLeads.length / (thisWeekLeads.length || 1),
  })

  return {
    period,
    summary: {
      total_leads: leadsArray.length,
      new_leads: thisWeekLeads.length,
      qualified_leads: qualifiedLeads.length,
      campaigns_sent: thisWeekCampaigns.length,
      posts_published: thisWeekPosts.length,
      calls_made: thisWeekCalls.length,
      revenue_pipeline_ngn: Math.floor(avgScore * 100000),
    },
    top_performers: {
      best_campaign: thisWeekCampaigns.length > 0 ? 'Email Outreach - Marine' : 'No campaigns this week',
      best_post_type: 'Product Spotlight',
      best_channel: 'WhatsApp',
      best_day: 'Wednesday',
    },
    division_breakdown: {
      marine: {
        leads: marineLeads.length,
        campaigns: marineCampaigns.length,
        posts: marinePosts.length,
      },
      tech: {
        leads: techLeads.length,
        campaigns: techCampaigns.length,
        posts: techPosts.length,
      },
    },
    recommendations,
    generated_at: now.toISOString(),
  }
}

function generateRecommendations(metrics: {
  leadsCount: number
  qualifiedCount: number
  campaignsCount: number
  postsCount: number
  callsCount: number
  avgScore: number
  marineRatio: number
}): string[] {
  const recommendations: string[] = []

  if (metrics.leadsCount < 10) {
    recommendations.push('Lead generation is low. Run a Google Maps scraping campaign for Port Harcourt businesses.')
  }

  if (metrics.qualifiedCount < metrics.leadsCount * 0.5) {
    recommendations.push('Qualification rate is below 50%. Run AI qualification on all pending leads.')
  }

  if (metrics.campaignsCount < 2) {
    recommendations.push('Only 1 or fewer campaigns this week. Schedule at least 2 outreach campaigns.')
  }

  if (metrics.postsCount < 5) {
    recommendations.push('Social media activity is low. Aim for at least 5 posts per week across platforms.')
  }

  if (metrics.callsCount === 0) {
    recommendations.push('No voice agent calls made. Set up outbound calling for hot leads.')
  }

  if (metrics.marineRatio > 0.7) {
    recommendations.push('Marine leads dominate. Consider a tech division promotion to balance.')
  } else if (metrics.marineRatio < 0.3) {
    recommendations.push('Tech leads dominate. Consider a marine equipment promotion.')
  }

  if (recommendations.length === 0) {
    recommendations.push('All metrics look good! Keep up the current strategy.')
  }

  return recommendations
}
