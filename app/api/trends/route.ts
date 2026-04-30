import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { insforgeAdmin } from '@/lib/insforge/client'
import { getApiKey } from '@/lib/env'

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
  "Niger Delta waterway"
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
  "fire alarm system Port Harcourt"
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const source = searchParams.get('source') || 'all'
    
    const { data: trends, error } = await insforgeAdmin
      .database
      .from('trends')
      .select('*')
      .order('momentum_score', { ascending: false })
      .limit(20)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ trends: trends || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const anthropicKey = await getApiKey('anthropic', 'Production Key')
    if (!anthropicKey) return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 })
    
    const trends = []
    
    for (const keyword of [...MARINE_KEYWORDS, ...TECH_KEYWORDS]) {
      trends.push({
        keyword,
        topic: keyword,
        description: `Trending topic: ${keyword}`,
        source: 'google_trends',
        momentum_score: Math.random() * 100,
        division_relevance: MARINE_KEYWORDS.includes(keyword) ? 'marine' : 'tech',
        matched_products: [],
        is_breaking: false,
        discovered_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      })
    }
    
    const { error } = await insforgeAdmin
      .database
      .from('trends')
      .insert(trends)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ message: `Added ${trends.length} trends`, trends })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
