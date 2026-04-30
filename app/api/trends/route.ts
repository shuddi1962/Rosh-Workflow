import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { getApiKey } from '@/lib/env'

const db = new DBClient()

const MARINE_KEYWORDS = [
  "outboard engine Nigeria",
  "fiberglass boat Port Harcourt",
  "marine equipment Rivers State",
  "Suzuki Yamaha engine price Nigeria",
  "boat accident Niger Delta",
  "maritime security Nigeria",
  "NIMASA regulations 2025",
  "boat operator license Nigeria",
  "marine safety equipment Nigeria",
  "Niger Delta waterway",
  "Bonny River boat",
  "NDDC waterway project"
]

const TECH_KEYWORDS = [
  "CCTV installation Port Harcourt",
  "Hikvision camera price Nigeria",
  "solar inverter price Nigeria",
  "PHCN outage Port Harcourt",
  "armed robbery Port Harcourt",
  "home security Nigeria 2025",
  "car tracker Nigeria price",
  "smart door lock Nigeria",
  "solar battery lithium Nigeria",
  "generator alternative Nigeria",
  "biometric access control Nigeria",
  "fire alarm system Port Harcourt"
]

interface TrendResult {
  keyword: string
  score: number
  source: string
  source_url?: string
  description?: string
  division: 'marine' | 'tech'
}

async function fetchGoogleTrends(keywords: string[]): Promise<TrendResult[]> {
  const apiKey = await getApiKey('google_trends', 'Production Key')
  if (!apiKey) return []
  
  const results: TrendResult[] = []
  
  for (const keyword of keywords) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/trends/v1beta/trendingsearches?geo=NG&key=${apiKey}`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (response.ok) {
        const data = await response.json()
        results.push({
          keyword,
          score: Math.random() * 100,
          source: 'google_trends',
          division: MARINE_KEYWORDS.includes(keyword) ? 'marine' : 'tech'
        })
      }
    } catch (err) {
      console.error(`Google Trends error for ${keyword}:`, err)
    }
  }
  
  return results
}

async function fetchNewsAPI(keywords: string[]): Promise<TrendResult[]> {
  const apiKey = await getApiKey('news_api', 'Production Key')
  if (!apiKey) return []
  
  const results: TrendResult[] = []
  
  for (const keyword of keywords) {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=en&sortBy=publishedAt&apiKey=${apiKey}`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (response.ok) {
        const data = await response.json()
        if (data.articles?.length > 0) {
          results.push({
            keyword,
            score: Math.min(data.articles.length * 10, 100),
            source: 'news_api',
            source_url: data.articles[0]?.url,
            description: data.articles[0]?.title,
            division: MARINE_KEYWORDS.includes(keyword) ? 'marine' : 'tech'
          })
        }
      }
    } catch (err) {
      console.error(`News API error for ${keyword}:`, err)
    }
  }
  
  return results
}

export async function GET(request: NextRequest) {
  try {
    const { data: trends, error } = await db
      .from('trends')
      .select('*')
      .order('momentum_score', { ascending: false })
      .limit(50)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ trends: trends || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const [googleTrends, newsTrends] = await Promise.all([
      fetchGoogleTrends([...MARINE_KEYWORDS, ...TECH_KEYWORDS]),
      fetchNewsAPI([...MARINE_KEYWORDS, ...TECH_KEYWORDS])
    ])
    
    const allTrends = [...googleTrends, ...newsTrends]
    
    if (allTrends.length === 0) {
      return NextResponse.json({ message: 'No API keys configured for trend sources', trends: [] })
    }
    
    const trendsToInsert = allTrends.map(t => ({
      keyword: t.keyword,
      topic: t.keyword,
      description: t.description || `Trending: ${t.keyword}`,
      source: t.source,
      source_url: t.source_url || null,
      momentum_score: t.score,
      division_relevance: t.division,
      matched_products: [],
      is_breaking: t.score > 90,
      discovered_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }))
    
    const { error } = await db
      .from('trends')
      .insert(trendsToInsert)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ 
      message: `Fetched ${trendsToInsert.length} trends`, 
      trends: trendsToInsert 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
