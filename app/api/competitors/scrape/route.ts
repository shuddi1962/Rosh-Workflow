import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { getApiKey } from '@/lib/env'
import { runApifyActor, getApifyDataset } from '@/lib/apify/client'

const db = new DBClient()

export async function POST(request: NextRequest) {
  try {
    const { competitor_id, scrape_type = 'google_maps' } = await request.json()
    
    if (!competitor_id) {
      return NextResponse.json({ error: 'competitor_id is required' }, { status: 400 })
    }
    
    const { data: competitor, error: compError } = await db
      .from('competitors')
      .select('*')
      .eq('id', competitor_id)
      .single()
    
    if (compError || !competitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }
    
    const compObj = competitor as unknown as Record<string, unknown>
    const apiKey = await getApiKey('apify', 'API Token')
    if (!apiKey) {
      return NextResponse.json({ error: 'Apify API key not configured' }, { status: 500 })
    }
    
    let scrapeResult
    if (scrape_type === 'google_maps') {
      const run = await runApifyActor('compass~google-maps-scraper', {
        searchString: compObj.name as string,
        location: 'Port Harcourt, Nigeria',
        maxPlacesPerQuery: 10
      })
      scrapeResult = run
    } else if (scrape_type === 'facebook_ads') {
      const run = await runApifyActor('apify~facebook-ad-library-scraper', {
        query: compObj.name as string,
        country: 'NG'
      })
      scrapeResult = run
    }
    
    await db
      .from('competitors')
      .update({ 
        last_scanned: new Date().toISOString(),
        intel_report: scrapeResult
      })
      .eq('id', competitor_id)
    
    return NextResponse.json({ 
      message: 'Scraping completed',
      competitor: compObj.name,
      result: scrapeResult
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await db
      .from('competitors')
      .select('*')
      .order('last_scanned', { ascending: false })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ competitors: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
