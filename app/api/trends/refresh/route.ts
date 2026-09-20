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
        "fiberglass boat Nigeria",
        "marine equipment Nigeria",
        "Suzuki marine Nigeria",
        "Yamaha boat engine",
        "maritime security Niger Delta",
        "NIMASA Nigeria",
        "boat safety Nigeria",
        "Niger Delta oil gas marine",
        "water transport Nigeria"
      ]
      const techKeywords = [
        "CCTV Nigeria",
        "Hikvision Nigeria",
        "solar power Nigeria",
        "surveillance system Port Harcourt",
        "smart door lock Nigeria",
        "car tracker Nigeria",
        "solar battery lithium Nigeria",
        "fire alarm system Nigeria",
        "access control Nigeria",
        "walkie talkie Nigeria",
        "biometric fingerprint Nigeria",
        "power outage Port Harcourt",
        "PHCN electricity Nigeria"
      ]

      const allKeywords = [...marineKeywords, ...techKeywords]
      const seenUrls = new Set<string>()

      for (const keyword of allKeywords) {
        try {
          const res = await fetch(
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=en&sortBy=publishedAt&pageSize=3&apiKey=${newsApiKey}`,
            { signal: AbortSignal.timeout(8000) }
          )
          if (res.ok) {
            const data = await res.json()
            if (data.articles && data.articles.length > 0) {
              for (const article of data.articles.slice(0, 3)) {
                if (!article.url || seenUrls.has(article.url)) continue
                const title = (article.title || '').toLowerCase()
                const desc = (article.description || '').toLowerCase()
                const content = title + ' ' + desc
                
                const marineSignals = /marine|boat|ship|water|engine|outboard|suzuki|yamaha|fiberglass|maritime|nigeria delta|oil\s*gas|waterway|port\s*harcourt|bonny|river|transport|navigat|bilk|vessel|dock|harbor/i.test(content)
                const techSignals = /cctv|camera|surveillance|hikvision|solar|battery|power|electricity|phcn|security|smart\s*lock|access\s*control|car\s*tracker|gps|fire\s*alarm|biometric|fingerprint|walkie|intercom|generator|inverter|renewable|grid/i.test(content)
                
                if (!marineSignals && !techSignals) continue

                seenUrls.add(article.url)
                const isMarine = marineSignals
                newTrends.push({
                  keyword: article.title,
                  topic: article.title,
                  description: article.description || '',
                  source: 'news_api',
                  source_url: article.url,
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
        { keyword: 'Suzuki outboard engine prices Nigeria 2026', topic: 'Suzuki outboard engine prices Nigeria 2026', description: 'Latest pricing and availability for Suzuki marine engines in Port Harcourt', source: 'Marine Market', source_url: null, momentum_score: 90, division_relevance: 'marine', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'PHCN power supply update Port Harcourt', topic: 'PHCN power supply update Port Harcourt', description: 'Latest electricity supply status driving solar demand in Rivers State', source: 'Local Context', source_url: null, momentum_score: 88, division_relevance: 'tech', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'Solar inverter and battery prices Nigeria', topic: 'Solar inverter and battery prices Nigeria', description: 'Lithium battery and solar system costs dropping making it affordable for homes and businesses', source: 'Energy Market', source_url: null, momentum_score: 85, division_relevance: 'tech', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'Niger Delta maritime security update', topic: 'Niger Delta maritime security update', description: 'Security situation affecting boat operators and marine equipment demand', source: 'Maritime', source_url: null, momentum_score: 82, division_relevance: 'marine', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'Hikvision CCTV surveillance demand Nigeria', topic: 'Hikvision CCTV surveillance demand Nigeria', description: 'Growing demand for professional CCTV installation in Port Harcourt homes and businesses', source: 'Security Market', source_url: null, momentum_score: 80, division_relevance: 'tech', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'Fiberglass boat repair and maintenance Niger Delta', topic: 'Fiberglass boat repair and maintenance Niger Delta', description: 'Increasing need for fiberglass boat repair services and chemicals in Rivers and Bayelsa', source: 'Marine Services', source_url: null, momentum_score: 78, division_relevance: 'marine', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'Smart door lock and biometric access control Nigeria', topic: 'Smart door lock and biometric access control Nigeria', description: 'Growing adoption of smart security systems in Nigerian homes and offices', source: 'Tech Market', source_url: null, momentum_score: 75, division_relevance: 'tech', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' },
        { keyword: 'Car tracker and GPS vehicle tracking Nigeria', topic: 'Car tracker and GPS vehicle tracking Nigeria', description: 'Rising vehicle theft driving demand for GPS tracking systems in Port Harcourt', source: 'Auto Security', source_url: null, momentum_score: 72, division_relevance: 'tech', matched_products: [], is_breaking: false, discovered_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'active' }
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
