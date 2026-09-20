import { callClaude } from '@/lib/ai/claude'
import { generateImage, OPENROUTER_IMAGE_MODELS } from '@/lib/openrouter/imageClient'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export interface BannerConfig {
  division: 'marine' | 'tech'
  product_id?: string
  banner_type: string
  style: string
  prompt: string
  product_name?: string
  product_image?: string
  size: string
  include_contact: boolean
  include_logo: boolean
  text_overlay?: string
}

export interface GeneratedBanner {
  id: string
  image_url: string
  prompt: string
  size: string
  format: string
  cost_usd: number
  created_at: string
}

const BANNER_SIZES: Record<string, { width: number; height: number; label: string }> = {
  'instagram_post': { width: 1080, height: 1080, label: 'Instagram Post (1080x1080)' },
  'instagram_story': { width: 1080, height: 1920, label: 'Instagram Story (1080x1920)' },
  'facebook_cover': { width: 1640, height: 856, label: 'Facebook Cover (1640x856)' },
  'facebook_post': { width: 1200, height: 630, label: 'Facebook Post (1200x630)' },
  'twitter_header': { width: 1500, height: 500, label: 'Twitter Header (1500x500)' },
  'linkedin_cover': { width: 1584, height: 396, label: 'LinkedIn Cover (1584x396)' },
  'whatsapp_status': { width: 1080, height: 1920, label: 'WhatsApp Status (1080x1920)' },
  'flyer_a4': { width: 2480, height: 3508, label: 'Flyer A4 Print (2480x3508)' },
  'flyer_a5': { width: 1748, height: 2480, label: 'Flyer A5 Print (1748x2480)' },
  'banner_outdoor': { width: 3000, height: 1000, label: 'Outdoor Banner (3000x1000)' },
  'business_card': { width: 1050, height: 600, label: 'Business Card (1050x600)' },
  'product_showcase': { width: 1080, height: 1080, label: 'Product Showcase (1080x1080)' },
}

const BANNER_TYPES = [
  'product_launch',
  'seasonal_offer',
  'security_awareness',
  'marine_safety',
  'new_arrival',
  'testimonial',
  'comparison',
  'how_to',
  'behind_scenes',
  'event',
  'price_announcement',
  'service_promotion',
  'brand_awareness',
  'ooh_billboard',
]

const STYLES = [
  'professional',
  'bold_modern',
  'minimalist',
  'vibrant',
  'corporate',
  'technical',
  'nigerian_cultural',
  'luxury',
]

export async function generateBanner(config: BannerConfig): Promise<GeneratedBanner | null> {
  const size = BANNER_SIZES[config.size] || BANNER_SIZES['instagram_post']

  const imagePrompt = buildImagePrompt(config, size)

  try {
    const model = Object.keys(OPENROUTER_IMAGE_MODELS)[0]
    const results = await generateImage(imagePrompt, model, {
      width: size.width,
      height: size.height,
    })

    if (results.length === 0) return null

    return {
      id: crypto.randomUUID(),
      image_url: results[0].url,
      prompt: imagePrompt,
      size: config.size,
      format: 'png',
      cost_usd: 0.04,
      created_at: new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export async function generateBannerPrompt(config: BannerConfig): Promise<string> {
  const size = BANNER_SIZES[config.size] || BANNER_SIZES['instagram_post']

  const prompt = `Create an image generation prompt for a ${config.banner_type} banner.

Division: ${config.division === 'marine' ? 'Marine Equipment' : 'Technology & Surveillance'}
Style: ${config.style}
Size: ${size.label}
Product: ${config.product_name || 'General'}

Company: Roshanal Infotech Limited, Port Harcourt, Nigeria
Contact: 08109522432

Requirements:
- Professional, high-quality design
- Nigerian context and aesthetics
- Clear visual hierarchy
- Space for text overlay if needed
- Dark background with accent colors (blue, gold, emerald)

Return ONLY the image prompt, nothing else.`

  try {
    const response = await callClaude(prompt, { max_tokens: 300 })
    return response.trim()
  } catch {
    return buildFallbackPrompt(config, size)
  }
}

function buildImagePrompt(config: BannerConfig, size: { width: number; height: number; label: string }): string {
  const divisionContext = config.division === 'marine'
    ? 'marine equipment, outboard engines, fiberglass boats, ocean blue tones'
    : 'CCTV cameras, security systems, solar panels, modern technology'

  const styleMap: Record<string, string> = {
    professional: 'clean, corporate, professional layout',
    bold_modern: 'bold typography, modern design, high contrast',
    minimalist: 'minimalist, lots of whitespace, elegant',
    vibrant: 'vibrant colors, energetic, eye-catching',
    corporate: 'corporate branding, trust-inspiring, formal',
    technical: 'technical specifications, detailed, engineering style',
    nigerian_cultural: 'Nigerian cultural elements, local aesthetics, warm tones',
    luxury: 'premium, luxury feel, gold accents, sophisticated',
  }

  return `${styleMap[config.style] || styleMap.professional} ${config.banner_type} banner for ${divisionContext}. Dark background with blue and gold accents. Professional product photography style. Size: ${size.label}. High quality, commercial advertising standard.`
}

function buildFallbackPrompt(config: BannerConfig, size: { label: string }): string {
  return `Professional ${config.banner_type} banner, ${config.division === 'marine' ? 'marine equipment' : 'security technology'}, ${config.style} style, dark theme with blue accents, ${size.label}, commercial quality`
}

export function getBannerSizes() {
  return Object.entries(BANNER_SIZES).map(([key, value]) => ({
    id: key,
    ...value,
  }))
}

export function getBannerTypes() {
  return BANNER_TYPES
}

export function getStyles() {
  return STYLES
}
