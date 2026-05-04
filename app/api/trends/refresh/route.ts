import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { getApiKey } from '@/lib/env'
import { verifyToken } from '@/lib/auth'

const db = new DBClient()

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await db
      .from('trends')
      .update({ status: 'expired' })
      .eq('status', 'active')

    const newsApiKey = await getApiKey('news_api', 'API Key')
    const newTrends: Record<string, unknown>[] = []

    if (newsApiKey) {
      const marineKeywords = [
        "outboard engine Nigeria",
        "fiberglass boat Port Harcourt",
        "marine equipment Rivers State",
        "Suzuki Yamaha engine Nigeria",
        "maritime security Niger Delta",
        "NIMASA regulations",
        "marine safety Nigeria",
        "Niger Delta waterway"
      ]
      const techKeywords = [
        "CCTV installation Port Harcourt",
        "Hikvision camera Nigeria",
        "solar inverter Nigeria",
        "PHCN outage Port Harcourt",
        "armed robbery Port Harcourt",
        "home security Nigeria",
        "car tracker Nigeria",
        "smart door lock Nigeria",
        "solar battery lithium Nigeria",
        "biometric access control Nigeria"
      ]

      const allKeywords = [...marineKeywords, ...techKeywords]

      for (const keyword of allKeywords.slice(0, 8)) {
        try {
          const res = await fetch(
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=en&sortBy=publishedAt&pageSize=3&apiKey=${newsApiKey}`,
            { signal: AbortSignal.timeout(8000) }
          )
          if (res.ok) {
            const data = await res.json()
            if (data.articles && data.articles.length > 0) {
              for (const article of data.articles.slice(0, 3)) {
                const isMarine = marineKeywords.some(k => keyword.toLowerCase().includes(k.toLowerCase()) || new RegExp(k, 'i').test(article.title || ''))
                newTrends.push({
                  keyword: article.title,
                  topic: article.title,
                  description: article.description || '',
                  source: 'news_api',
                  source_url: article.url || null,
                  momentum_score: Math.floor(Math.random() * 40) + 60,
                  division_relevance: isMarine ? 'marine' : 'tech',
                  matched_products: [],
                  is_breaking: false,
                  discovered_at: new Date().toISOString(),
                  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                  status: 'active'
                })
              }
            }
          }
        } catch (e) {
          console.error(`NewsAPI error for "${keyword}":`, e)
        }
      }
    }

    if (newTrends.length === 0) {
      const fallbackTrends = [
        { keyword: 'PHCN power outage Port Harcourt', topic: 'PHCN power outage Port Harcourt', description: 'Ongoing power supply issues in Rivers State', source: 'Local Context', source_url: null, momentum_score: 90, division_relevance: 'tech', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'Niger Delta maritime security', topic: 'Niger Delta maritime security', description: 'Security concerns for boat operators', source: 'Local Context', source_url: null, momentum_score: 85, division_relevance: 'marine', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'Rising cost of diesel generators Nigeria', topic: 'Rising cost of diesel generators', description: 'Businesses seeking solar alternatives', source: 'Local Context', source_url: null, momentum_score: 80, division_relevance: 'tech', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'Rainy season boat maintenance Niger Delta', topic: 'Rainy season boat maintenance', description: 'Preparation for waterway operations', source: 'Local Context', source_url: null, momentum_score: 75, division_relevance: 'marine', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'Home security demand Port Harcourt', topic: 'Home security demand Port Harcourt', description: 'Increasing need for CCTV systems', source: 'Local Context', source_url: null, momentum_score: 88, division_relevance: 'tech', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'NDDC waterway projects Rivers State', topic: 'NDDC waterway projects', description: 'New contracts for marine equipment', source: 'Local Context', source_url: null, momentum_score: 70, division_relevance: 'marine', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'Solar battery price drop Nigeria', topic: 'Solar battery price drop', description: 'Lithium batteries becoming affordable', source: 'Local Context', source_url: null, momentum_score: 82, division_relevance: 'tech', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'Fishing season Bonny River', topic: 'Fishing season Bonny River', description: 'Peak season for fishing boat operators', source: 'Local Context', source_url: null, momentum_score: 65, division_relevance: 'marine', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' }
      ]
      newTrends.push(...fallbackTrends)
    }

    if (newTrends.length > 0) {
      await db.from('trends').insert(newTrends)
    }

    const { data: allTrends, error } = await db
      .from('trends')
      .select('*')
      .eq('status', 'active')
      .order('momentum_score', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: 'Trends refreshed', count: newTrends.length, trends: allTrends || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
