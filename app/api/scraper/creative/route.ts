import { NextResponse } from 'next/server'
import { scrapeURLCreative, transformToUGC, transformToVideoScript } from '@/lib/scraper/creative-scraper'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, division, transform_type } = body as {
      url: string
      division: 'marine' | 'tech'
      transform_type?: 'ugc' | 'video'
    }

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const creative = await scrapeURLCreative(url)
    if (!creative) {
      return NextResponse.json({ error: 'Failed to scrape URL. The page may be blocking automated access.' }, { status: 500 })
    }

    let transformed = ''
    if (transform_type === 'ugc') {
      transformed = await transformToUGC(creative, division)
    } else if (transform_type === 'video') {
      transformed = await transformToVideoScript(creative, division)
    }

    return NextResponse.json({
      creative,
      transformed: transformed || null,
      message: `Found ${creative.images.length} images and ${creative.videos.length} videos`,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
