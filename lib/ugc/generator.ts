import { generateContent } from '@/lib/ai/claude'

export interface UGCAdType {
  id: string
  division: 'marine' | 'tech'
  product_id?: string
  ad_type: string
  platform: string
  headline: string
  primary_text: string
  description?: string
  cta_button: string
  video_script?: string
  image_url?: string
  status: 'draft' | 'approved' | 'used'
  used_in_campaign: boolean
  campaign_id?: string
  created_at: string
}

export const UGC_AD_TYPES = [
  'Customer testimonial video script',
  'Product unboxing video script',
  'Installation process walkthrough script',
  'Problem → Agitation → Solution video script',
  'Day in the life of someone using our product',
  'Behind-the-scenes vlog style script',
  'Facebook/Instagram lead generation ad',
  'Multi-slide carousel ad (swipe through)',
  '15-second story ad with text overlays',
  'Clean product showcase with specs',
  'Before/after transformation ad',
  'Limited time offer/discount ad',
  'WhatsApp broadcast message',
  'WhatsApp status text/image',
  'WhatsApp product catalog message',
  'Google Search ad (headline + descriptions)',
  'Google Display ad copy',
  'Promotional email blast',
  'Follow-up email sequence',
  'Bulk SMS marketing message'
]

export async function generateUGCAd(params: {
  adType: string
  division: 'marine' | 'tech'
  productId?: string
  productName?: string
  productDescription?: string
  platform: string
  businessProfile: string
}): Promise<{ headline: string; primary_text: string; description: string; cta_button: string; video_script?: string }> {
  const prompt = `Generate a ${params.adType} for Roshanal Infotech Limited.

BUSINESS PROFILE:
${params.businessProfile}

DIVISION: ${params.division}
PRODUCT: ${params.productName || 'General'}
PRODUCT DESCRIPTION: ${params.productDescription || ''}
PLATFORM: ${params.platform}

Create compelling, conversion-focused content that:
1. Speaks directly to businesses and individuals in Port Harcourt, Rivers State, and the Niger Delta
2. References real local pain points (insecurity, PHCN failures, waterway operations)
3. Always includes contact info: 08109522432 | 08033170802 | 08180388018
4. Uses authentic Nigerian English
5. Drives action (DM, WhatsApp, Call, Visit showroom)
6. Creates genuine urgency

Return JSON with: headline, primary_text, description, cta_button, and video_script (if applicable).`

  const response = await generateContent({
    businessProfile: params.businessProfile,
    productCatalog: params.productName || '',
    trends: '',
    contentType: params.adType,
    division: params.division,
    platform: params.platform
  })
  
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error('Error parsing UGC response:', error)
  }
  
  return {
    headline: 'Roshanal Infotech - Quality Solutions',
    primary_text: response.content,
    description: 'Contact us today for the best marine and tech solutions in Port Harcourt.',
    cta_button: 'Contact Us'
  }
}

export async function generateVideoScript(params: {
  productName: string
  productDescription: string
  duration: '15s' | '30s' | '60s'
  style: 'testimonial' | 'unboxing' | 'demo' | 'problem-solution'
}): Promise<string> {
  const prompt = `Create a ${params.duration} video script for ${params.productName}.

PRODUCT: ${params.productName}
DESCRIPTION: ${params.productDescription}
STYLE: ${params.style}

Structure:
- Hook (first 3 seconds)
- Main content
- CTA to WhatsApp/call

Include:
- Visual directions in [brackets]
- Spoken dialogue
- Text overlays
- Contact info: 08109522432 | 08033170802 | 08180388018`

  const response = await generateContent({
    businessProfile: 'Roshanal Infotech Limited - Marine & Technology Solutions',
    productCatalog: `${params.productName}: ${params.productDescription}`,
    trends: '',
    contentType: 'video script',
    division: 'tech',
    platform: 'video'
  })
  
  return response.content
}
