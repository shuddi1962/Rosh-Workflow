export interface ScrapedCreative {
  url: string
  title: string
  description: string
  images: string[]
  videos: string[]
  ad_copy?: string
  cta?: string
  brand?: string
  extracted_at: string
}

export interface CreativeTransformation {
  type: 'ugc_ad' | 'video_script' | 'social_post' | 'banner_prompt'
  input_url: string
  scraped_data: ScrapedCreative
  transformed_content: string
  hashtags?: string[]
  platform?: string
}

export async function scrapeURLCreative(url: string): Promise<ScrapedCreative | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) return null

    const html = await response.text()
    const title = extractMetaTag(html, 'og:title') || extractTitle(html)
    const description = extractMetaTag(html, 'og:description') || extractMetaTag(html, 'description') || ''
    const images = extractImages(html)
    const videos = extractVideos(html)

    return {
      url,
      title,
      description,
      images,
      videos,
      extracted_at: new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export async function transformToUGC(creative: ScrapedCreative, division: 'marine' | 'tech'): Promise<string> {
  return `PROBLEM-SOLVING UGC AD SCRIPT

HOOK (0-3 seconds):
"Are you still dealing with ${creative.title}? Here's what worked for me..."

PROBLEM (3-10 seconds):
${creative.description}

SOLUTION (10-25 seconds):
"That's why I switched to Roshanal Infotech. They're based right here in Port Harcourt and have everything we need."

PRODUCT SHOWCASE (25-40 seconds):
Show the product in action. Mention key features:
${creative.images.length > 0 ? `- [Use product image from: ${creative.images[0]}]` : '- Show product packaging'}

CTA (40-45 seconds):
"Call 08109522432 or WhatsApp them now. They're at 18A Rumuola Road, Port Harcourt."

PLATFORM: Instagram Reels / TikTok
DIVISION: ${division}
HASHTAGS: #${division === 'marine' ? 'MarineEquipment PortHarcourt NigerDelta' : 'CCTV PortHarcourt HomeSecurity Nigeria'} #RoshanalInfotech`
}

export async function transformToVideoScript(creative: ScrapedCreative, division: 'marine' | 'tech'): Promise<string> {
  return `CINEMATIC VIDEO SCRIPT

SCENE 1 - HOOK (0-5s)
Visual: Opening shot of ${creative.title}
Text overlay: "The ${division === 'marine' ? 'marine' : 'security'} solution every Port Harcourt business needs"
Music: Upbeat, professional

SCENE 2 - PROBLEM (5-15s)
Visual: Show the pain point
Voiceover: "${creative.description.substring(0, 150)}..."
Text: "Sound familiar?"

SCENE 3 - SOLUTION REVEAL (15-25s)
Visual: Roshanal Infotech showroom/product
Voiceover: "At Roshanal Infotech, we've got the solution. Genuine products, expert installation, right here in Port Harcourt."

SCENE 4 - PRODUCT FEATURES (25-40s)
Visual: Product demonstration
Voiceover: List 3 key features
Text overlays: Feature 1, Feature 2, Feature 3

SCENE 5 - CTA (40-45s)
Visual: Roshanal Infotech logo + contact
Voiceover: "Call 08109522432 or visit 18A Rumuola Road today."
Text: 📞 08109522432 | 📍 Port Harcourt

DIVISION: ${division}
STYLE: Professional, cinematic
MUSIC: Upbeat African instrumental`
}

function extractMetaTag(html: string, name: string): string {
  const regex = new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:)?${name}["'][^>]+content=["']([^"']+)["']`, 'i')
  const match = html.match(regex)
  return match ? match[1] : ''
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match ? match[1].trim() : ''
}

function extractImages(html: string): string[] {
  const images: string[] = []
  const ogImage = extractMetaTag(html, 'og:image')
  if (ogImage) images.push(ogImage)

  const regex = /<img[^>]+src=["']([^"']+)["']/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    if (match[1] && !match[1].includes('data:') && images.length < 10) {
      images.push(match[1])
    }
  }
  return images.slice(0, 5)
}

function extractVideos(html: string): string[] {
  const videos: string[] = []
  const ogVideo = extractMetaTag(html, 'og:video')
  if (ogVideo) videos.push(ogVideo)

  const regex = /<video[^>]+src=["']([^"']+)["']/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    if (match[1] && videos.length < 5) {
      videos.push(match[1])
    }
  }
  return videos
}
