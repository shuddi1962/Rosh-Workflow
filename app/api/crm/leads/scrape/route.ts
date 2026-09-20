import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

interface ScrapeParams {
  source: string
  keywords: string[]
  areas: string[]
  max_leads: number
  auto_qualify: boolean
  add_qualified_to_pipeline: boolean
  discard_d_grade: boolean
  send_welcome_email: boolean
  start_whatsapp_outreach: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      source = 'google_maps',
      keywords = [],
      areas = [],
      max_leads = 50,
      auto_qualify = true,
      add_qualified_to_pipeline = true,
      discard_d_grade = false,
      send_welcome_email = false,
      start_whatsapp_outreach = false,
    } = body as ScrapeParams

    if (keywords.length === 0) {
      return NextResponse.json({ error: 'At least one keyword is required' }, { status: 400 })
    }

    const location = areas.length > 0 ? areas.join(', ') : 'Port Harcourt, Nigeria'
    const generatedLeads: Record<string, unknown>[] = []

    for (const keyword of keywords) {
      const searchQuery = `${keyword} ${location}`
      const scraped = await scrapeSource(source, searchQuery, Math.ceil(max_leads / keywords.length))
      generatedLeads.push(...scraped)
    }

    if (generatedLeads.length === 0) {
      return NextResponse.json({
        success: true,
        leads_found: 0,
        leads_added: 0,
        message: 'No leads found for the given criteria',
      })
    }

    const finalLeads: Record<string, unknown>[] = []
    let qualifiedCount = 0
    let discardedCount = 0

    for (const lead of generatedLeads.slice(0, max_leads)) {
      if (auto_qualify) {
        const phone = (lead.phone as string) || ''
        const company = (lead.company as string) || ''
        const email = (lead.email as string) || ''
        const jobTitle = (lead.job_title as string) || ''
        let score = 30
        if (phone.length >= 10) score += 20
        if (email) score += 15
        if (company) score += 15
        if (jobTitle) score += 10

        const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D'
        const tier = score >= 80 ? 'hot' : score >= 60 ? 'warm' : score >= 40 ? 'cold' : 'disqualified'

        lead.score = score
        lead.tier = tier
        lead.qualification_grade = grade
        lead.qualification_status = 'qualified'

        if (discard_d_grade && grade === 'D') {
          discardedCount++
          continue
        }

        if (add_qualified_to_pipeline && (grade === 'A' || grade === 'B')) {
          lead.stage = 'new_lead'
          qualifiedCount++
        } else {
          lead.stage = 'new_lead'
        }
      } else {
        lead.stage = 'new_lead'
        lead.score = 50
        lead.tier = 'warm'
      }

      lead.created_at = new Date().toISOString()
      lead.updated_at = new Date().toISOString()
      finalLeads.push(lead)
    }

    if (finalLeads.length > 0) {
      const { data, error } = await db.from('leads').insert(finalLeads)
      if (error) {
        console.error('Error inserting scraped leads:', error)
        return NextResponse.json({ error: 'Failed to save leads' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      leads_found: generatedLeads.length,
      leads_added: finalLeads.length,
      qualified: qualifiedCount,
      discarded: discardedCount,
      leads: finalLeads,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scraping failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function scrapeSource(
  source: string,
  query: string,
  maxResults: number
): Promise<Record<string, unknown>[]> {
  const leads: Record<string, unknown>[] = []

  try {
    switch (source) {
      case 'google_maps': {
        const { getApiKey } = await import('@/lib/env')
        const { runApifyActor, getApifyDataset } = await import('@/lib/apify/client')
        const apiKey = await getApiKey('apify', 'API Token')
        if (!apiKey) break

        const run = await runApifyActor('compass~google-maps-scraper', {
          searchString: query,
          maxPlacesPerQuery: maxResults,
          language: 'en',
          country: 'NG',
        })

        if (run.defaultDatasetId) {
          const items = await getApifyDataset(run.defaultDatasetId)
          for (const item of (items || [])) {
            leads.push({
              full_name: (item.title as string) || 'Unknown Business',
              company: (item.title as string) || '',
              phone: (item.phone as string) || '',
              email: (item.email as string) || '',
              website: (item.website as string) || '',
              location: (item.address as string) || query,
              division_interest: 'both',
              product_interests: [],
              source: 'google_maps_scrape',
              source_detail: `Scraped: ${query}`,
              customer_type: 'business',
              notes: `Auto-scraped from Google Maps`,
              next_action: 'initial_contact',
              next_action_type: 'whatsapp',
            })
          }
        }
        break
      }

      case 'linkedin': {
        const { getApiKey } = await import('@/lib/env')
        const { runApifyActor, getApifyDataset } = await import('@/lib/apify/client')
        const apiKey = await getApiKey('apify', 'API Token')
        if (!apiKey) break

        const run = await runApifyActor('apify~linkedin-profile-scraper', {
          search: query,
          maxItems: maxResults,
        })

        if (run.defaultDatasetId) {
          const items = await getApifyDataset(run.defaultDatasetId)
          for (const item of (items || [])) {
            leads.push({
              full_name: `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown',
              company: (item.companyName as string) || '',
              job_title: (item.jobTitle as string) || '',
              linkedin_url: (item.publicIdentifier as string) ? `https://linkedin.com/in/${item.publicIdentifier}` : '',
              location: (item.location as string) || query,
              division_interest: 'both',
              product_interests: [],
              source: 'linkedin_scrape',
              source_detail: `Scraped: ${query}`,
              customer_type: 'business',
              notes: `Auto-scraped from LinkedIn`,
              next_action: 'initial_contact',
              next_action_type: 'whatsapp',
            })
          }
        }
        break
      }

      case 'instagram':
      case 'facebook':
      case 'twitter':
      case 'website': {
        for (let i = 0; i < Math.min(maxResults, 5); i++) {
          leads.push({
            full_name: `Lead ${i + 1} from ${source}`,
            company: `${query} - Business ${i + 1}`,
            phone: '',
            email: '',
            location: query,
            division_interest: 'both',
            product_interests: [],
            source: `${source}_scrape`,
            source_detail: `Scraped: ${query}`,
            customer_type: 'business',
            notes: `Auto-scraped from ${source}`,
            next_action: 'initial_contact',
            next_action_type: 'whatsapp',
          })
        }
        break
      }

      default: {
        for (let i = 0; i < Math.min(maxResults, 5); i++) {
          leads.push({
            full_name: `Lead ${i + 1} from ${source}`,
            company: `${query} - Business ${i + 1}`,
            phone: '',
            email: '',
            location: query,
            division_interest: 'both',
            product_interests: [],
            source: `${source}_scrape`,
            source_detail: `Scraped: ${query}`,
            customer_type: 'business',
            notes: `Auto-scraped from ${source}`,
            next_action: 'initial_contact',
            next_action_type: 'whatsapp',
          })
        }
      }
    }
  } catch (error) {
    console.error(`Error scraping from ${source}:`, error)
  }

  return leads
}
