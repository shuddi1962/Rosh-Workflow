import { getApiKey } from '@/lib/env'

const APIFY_BASE_URL = 'https://api.apify.com/v2'

export interface ApifyActorRun {
  actorId: string
  input: Record<string, any>
}

export async function runApifyActor(actorId: string, input: Record<string, any>) {
  const apiKey = await getApiKey('apify', 'Production Key')
  if (!apiKey) throw new Error('Apify API key not configured')
  
  const response = await fetch(`${APIFY_BASE_URL}/acts/${actorId}/runs?token=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(60000)
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Apify actor run failed: ${error}`)
  }
  
  return response.json()
}

export async function getApifyDataset(datasetId: string) {
  const apiKey = await getApiKey('apify', 'Production Key')
  if (!apiKey) throw new Error('Apify API key not configured')
  
  const response = await fetch(
    `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${apiKey}`,
    { signal: AbortSignal.timeout(30000) }
  )
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get dataset: ${error}`)
  }
  
  return response.json()
}

export async function scrapeGoogleMaps(query: string, location: string = 'Port Harcourt, Nigeria') {
  return runApifyActor('compass~google-maps-scraper', {
    searchString: query,
    location,
    maxPlacesPerQuery: 20,
    language: 'en',
    country: 'NG'
  })
}

export async function scrapeInstagramProfiles(usernames: string[]) {
  return runApifyActor('apify~instagram-scraper', {
    usernames,
    resultsLimit: 50
  })
}

export async function scrapeFacebookAds() {
  return runApifyActor('apify~facebook-ad-library-scraper', {
    query: 'CCTV Port Harcourt',
    adType: 'POLITICAL_AND_ISSUE_ADS',
    country: 'NG'
  })
}
