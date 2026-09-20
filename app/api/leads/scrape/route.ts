import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { getApiKey } from '@/lib/env'

const db = new DBClient()
import { runApifyActor, getApifyDataset } from '@/lib/apify/client'

export async function POST(request: NextRequest) {
  try {
    const { source = 'google_maps', query } = await request.json()
    
    const apiKey = await getApiKey('apify', 'API Token')
    if (!apiKey) {
      return NextResponse.json({ error: 'Apify API key not configured' }, { status: 500 })
    }
    
    let leads: any[] = []
    
    if (source === 'google_maps') {
      const searches = query ? [query] : [
        "oil companies Port Harcourt",
        "boat operators Rivers State",
        "security companies Port Harcourt",
        "hotels Port Harcourt",
        "banks Port Harcourt"
      ]
      
      for (const search of searches) {
        try {
          const run = await runApifyActor('compass~google-maps-scraper', {
            searchString: search,
            location: 'Port Harcourt, Nigeria',
            maxPlacesPerQuery: 10,
            language: 'en',
            country: 'NG'
          })
          
          if (run.defaultDatasetId) {
            const items = await getApifyDataset(run.defaultDatasetId)
            leads = [...leads, ...items.map((item: any) => ({
              name: item.title || 'Unknown',
              phone: item.phone || '',
              email: item.email || '',
              company: item.title || '',
              location: item.address || 'Port Harcourt',
              division_interest: item.title?.toLowerCase().includes('security') || item.title?.toLowerCase().includes('cctv') ? 'tech' : 'marine',
              product_interest: [],
              source: 'scraping',
              status: 'new',
              score: 50,
              tier: 'warm' as const,
              created_at: new Date().toISOString()
            }))]
          }
        } catch (err: any) {
          console.error(`Error scraping "${search}":`, err.message)
        }
      }
    }
    
    if (leads.length === 0) {
      return NextResponse.json({ message: 'No leads found. Check Apify configuration.', leads: [] })
    }
    
    const { error } = await db
      .from('leads')
      .insert(leads)
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ 
      message: `Scraped ${leads.length} leads`, 
      leads: leads.slice(0, 10) 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}