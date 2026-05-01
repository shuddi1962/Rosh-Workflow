import { DBClient } from '@/lib/insforge/server'
import { analyzeCompetitors } from '@/lib/ai/claude'

const db = new DBClient()

export interface CompetitorIntelReport {
  top_performing_posts: Array<{
    platform: string
    content: string
    engagement: number
    post_type: string
    what_worked: string
  }>
  posting_frequency: Array<{
    platform: string
    posts_per_week: number
    best_days: string[]
    best_times: string[]
  }>
  hashtag_strategy: {
    most_used: string[]
    highest_engagement: string[]
    hashtags_they_own: string[]
    hashtag_gaps: string[]
  }
  content_formats: {
    image_percentage: number
    video_percentage: number
    reel_percentage: number
    text_percentage: number
    carousel_percentage: number
    top_format: string
  }
  active_ads: Array<{
    ad_type: string
    creative_description: string
    copy_angle: string
    cta: string
    estimated_run_days: number
    what_we_can_steal: string
  }>
  content_gaps: string[]
  audience_gaps: string[]
  offer_gaps: string[]
  location_gaps: string[]
  roshanal_weaknesses: Array<{
    weakness: string
    competitor_doing_it: string
    recommended_fix: string
    priority: 'critical' | 'high' | 'medium'
  }>
  immediate_actions: string[]
  content_ideas_from_competitor: string[]
  counter_campaign_ideas: string[]
}

export async function scrapeCompetitor(competitorId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: competitor, error } = await db
      .from('competitors')
      .select('*')
      .eq('id', competitorId)
      .single()
    
    if (error || !competitor) {
      return { success: false, error: 'Competitor not found' }
    }
    
    const competitorObj = competitor as unknown as Record<string, unknown>
    const facebookUrl = competitorObj.facebook_url as string | undefined
    const instagramUrl = competitorObj.instagram_url as string | undefined
    
    if (facebookUrl) {
      await scrapeFacebookPage(competitorId, facebookUrl)
    }
    
    if (instagramUrl) {
      await scrapeInstagramPage(competitorId, instagramUrl)
    }
    
    await db.from('competitors').update({
      last_scanned: new Date().toISOString()
    }).eq('id', competitorId)
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown scraping error'
    }
  }
}

async function scrapeFacebookPage(competitorId: string, url: string): Promise<void> {
  try {
    const apifyToken = process.env.APIFY_API_TOKEN
    if (!apifyToken) return
    
    const response = await fetch('https://api.apify.com/v2/acts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apifyToken}`
      },
      body: JSON.stringify({
        actorId: 'apify/facebook-page-scraper',
        input: { urls: [url] }
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`Facebook scrape started for competitor ${competitorId}:`, data)
    }
  } catch (error) {
    console.error('Error scraping Facebook:', error)
  }
}

async function scrapeInstagramPage(competitorId: string, url: string): Promise<void> {
  try {
    const apifyToken = process.env.APIFY_API_TOKEN
    if (!apifyToken) return
    
    const response = await fetch('https://api.apify.com/v2/acts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apifyToken}`
      },
      body: JSON.stringify({
        actorId: 'apify/instagram-scraper',
        input: { urls: [url] }
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`Instagram scrape started for competitor ${competitorId}:`, data)
    }
  } catch (error) {
    console.error('Error scraping Instagram:', error)
  }
}

export async function generateIntelReport(competitorId: string): Promise<CompetitorIntelReport | null> {
  const { data: competitor } = await db
    .from('competitors')
    .select('*')
    .eq('id', competitorId)
    .single()
  
  if (!competitor) return null
  
  const competitorObj = competitor as unknown as Record<string, unknown>
  
  const { data: roshanalPosts } = await db
    .from('social_posts')
    .select('*')
    .limit(50)
  
  const competitorData = JSON.stringify(competitorObj.intel_report)
  const roshanalData = JSON.stringify(roshanalPosts)
  
  try {
    const aiResponse = await analyzeCompetitors({
      competitorData,
      roshanalData
    })
    
    const report = JSON.parse(aiResponse.content) as CompetitorIntelReport
    
    await db.from('competitors').update({
      intel_report: report,
      last_scanned: new Date().toISOString()
    }).eq('id', competitorId)
    
    return report
  } catch (error) {
    console.error('Error generating intel report:', error)
    return null
  }
}

export async function scrapeAllCompetitors(): Promise<{ total: number; success: number; failed: number }> {
  const { data: competitors } = await db
    .from('competitors')
    .select('*')
  
  if (!competitors) return { total: 0, success: 0, failed: 0 }
  
  let success = 0
  let failed = 0
  
  for (const competitor of competitors) {
    const compObj = competitor as unknown as Record<string, unknown>
    const result = await scrapeCompetitor(compObj.id as string)
    if (result.success) success++
    else failed++
  }
  
  return { total: competitors.length, success, failed }
}

export async function getGapAnalysis(): Promise<{ content_gaps: string[]; opportunities: string[] }> {
  const { data: competitors } = await db
    .from('competitors')
    .select('*')
  
  const contentGaps: string[] = []
  const opportunities: string[] = []
  
  if (competitors) {
    for (const competitor of competitors) {
      const compObj = competitor as unknown as Record<string, unknown>
      const report = compObj.intel_report as Record<string, unknown> | undefined
      
      if (report && Array.isArray(report.content_gaps)) {
        contentGaps.push(...(report.content_gaps as string[]))
      }
    }
  }
  
  return {
    content_gaps: [...new Set(contentGaps)],
    opportunities: [
      'Create video content showing product installations in Port Harcourt',
      'Develop WhatsApp-first customer engagement strategy',
      'Publish case studies from local Niger Delta clients',
      'Create educational content about marine safety compliance',
      'Build solar ROI calculator for Nigerian businesses'
    ]
  }
}
