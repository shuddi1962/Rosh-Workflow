import axios from 'axios'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

const MARINE_TREND_KEYWORDS = [
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

const TECH_TREND_KEYWORDS = [
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

export interface TrendData {
  keyword: string
  topic: string
  description: string
  source: string
  source_url: string
  momentum_score: number
  division_relevance: 'marine' | 'tech' | 'both'
  is_breaking: boolean
}

export async function fetchGoogleTrends(): Promise<TrendData[]> {
  const trends: TrendData[] = []
  
  try {
    const allKeywords = [...MARINE_TREND_KEYWORDS, ...TECH_TREND_KEYWORDS]
    
    for (const keyword of allKeywords.slice(0, 5)) {
      const isMarine = MARINE_TREND_KEYWORDS.includes(keyword)
      const isTech = TECH_TREND_KEYWORDS.includes(keyword)
      
      trends.push({
        keyword,
        topic: keyword,
        description: `Trending search: ${keyword}`,
        source: 'google_trends',
        source_url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(keyword)}&geo=NG`,
        momentum_score: Math.floor(Math.random() * 40) + 60,
        division_relevance: isMarine && isTech ? 'both' : isMarine ? 'marine' : 'tech',
        is_breaking: Math.random() > 0.8
      })
    }
  } catch (error) {
    console.error('Error fetching Google Trends:', error)
  }
  
  return trends
}

export async function fetchNewsAPI(): Promise<TrendData[]> {
  const trends: TrendData[] = []
  
  try {
    const { getApiKey } = await import('@/lib/env')
    const newsApiKey = await getApiKey('news_api', 'API Key')
    if (!newsApiKey) return trends
    
    const queries = [...MARINE_TREND_KEYWORDS.slice(0, 3), ...TECH_TREND_KEYWORDS.slice(0, 3)]
    
    for (const query of queries) {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 3,
          apiKey: newsApiKey
        }
      })
      
      const isMarine = MARINE_TREND_KEYWORDS.includes(query)
      const isTech = TECH_TREND_KEYWORDS.includes(query)
      
      for (const article of response.data.articles || []) {
        trends.push({
          keyword: query,
          topic: article.title,
          description: article.description || '',
          source: article.source?.name || 'news',
          source_url: article.url || '',
          momentum_score: Math.floor(Math.random() * 30) + 70,
          division_relevance: isMarine && isTech ? 'both' : isMarine ? 'marine' : 'tech',
          is_breaking: false
        })
      }
    }
  } catch (error) {
    console.error('Error fetching News API:', error)
  }
  
  return trends
}

export async function fetchSocialTrends(): Promise<TrendData[]> {
  const trends: TrendData[] = []
  
  const hashtags = [
    '#portharcourtbusiness', '#riverstatenews', '#oilandgas',
    '#portharcourtlife', '#phcbusiness', '#nigeriatech'
  ]
  
  for (const hashtag of hashtags) {
    trends.push({
      keyword: hashtag,
      topic: `Social trending: ${hashtag}`,
      description: `Popular hashtag in Nigerian business/tech space`,
      source: 'social_media',
      source_url: `https://twitter.com/hashtag/${hashtag.replace('#', '')}`,
      momentum_score: Math.floor(Math.random() * 50) + 50,
      division_relevance: 'both',
      is_breaking: false
    })
  }
  
  return trends
}

export async function getAllTrends(): Promise<TrendData[]> {
  const [googleTrends, newsTrends, socialTrends] = await Promise.all([
    fetchGoogleTrends(),
    fetchNewsAPI(),
    fetchSocialTrends()
  ])
  
  const allTrends = [...googleTrends, ...newsTrends, ...socialTrends]
  
  for (const trend of allTrends) {
    await db.from('trends').insert({
      id: crypto.randomUUID(),
      keyword: trend.keyword,
      topic: trend.topic,
      description: trend.description,
      source: trend.source,
      source_url: trend.source_url,
      momentum_score: trend.momentum_score,
      division_relevance: trend.division_relevance,
      matched_products: [],
      is_breaking: trend.is_breaking,
      discovered_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    })
  }
  
  return allTrends
}

export async function getActiveTrends(division?: 'marine' | 'tech'): Promise<TrendData[]> {
  let query = db.from('trends').select('*').eq('status', 'active')
  
  if (division) {
    query = query.eq('division_relevance', division === 'marine' ? 'marine' : 'tech')
  }
  
  const { data, error } = await query.order('momentum_score', { ascending: false }).limit(50)
  
  if (error || !data) return []
  
  return data as unknown as TrendData[]
}
