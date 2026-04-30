import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { getApiKey } from '@/lib/env'

const db = new DBClient()

const ROSHANAL_BUSINESS_PROFILE = {
  name: "Roshanal Infotech Limited",
  tagline: "Your Trusted Partner for Marine & Technology Solutions",
  divisions: {
    marine: {
      name: "Marine Division",
      products: ["Outboard Engines (Suzuki, Yamaha)", "Fiberglass Boats", "Marine Safety Tools", "Bilge Pumps", "Marine Electronics"],
      target_customers: ["Oil & Gas companies", "Commercial boat operators", "Fishermen in Rivers State", "NDDC contractors"],
      pain_points: ["Difficulty sourcing genuine parts in Port Harcourt", "No reliable fiberglass repair", "Safety compliance requirements"],
      usps: ["Genuine Suzuki and Yamaha authorized", "Located in Port Harcourt — no Lagos trips", "Expert fiberglass repair"]
    },
    tech: {
      name: "Technology & Surveillance Division",
      products: ["Hikvision CCTV", "Solar Systems", "Smart Door Locks", "Car Trackers", "Fire Alarm Systems", "Walkie-Talkies"],
      target_customers: ["Homes in GRA Port Harcourt", "Banks", "Schools", "Hotels"],
      pain_points: ["Insecurity and armed robbery", "Epileptic PHCN power", "Vehicle theft in Port Harcourt"],
      usps: ["Hikvision authorized dealer", "Same-day installation in Port Harcourt", "24/7 technical support"]
    }
  },
  contact: {
    phone: "08109522432 | 08033170802 | 08180388018",
    email: "info@roshanalinfotech.com",
    address: "No 18A Rumuola/Rumuadaolu Road, Port Harcourt, Rivers State",
    branch: "41 Eastern Bypass, Opp NDDC Building, Port Harcourt",
    branch2: "223 Chief Melfold Okilo Way, Amarat, Yenegoa, Bayelsa"
  },
  brand_voice: "Professional yet approachable, expert authority, local Nigerian context, urgent CTAs, WhatsApp-first communication"
}

export async function POST(request: NextRequest) {
  try {
    const { division, post_type, product_id, trend_id, platform = 'instagram' } = await request.json()
    
    if (!division || !post_type) {
      return NextResponse.json({ error: 'division and post_type are required' }, { status: 400 })
    }
    
    const anthropicKey = await getApiKey('anthropic', 'Production Key')
    if (!anthropicKey) {
      return NextResponse.json({ error: 'Anthropic API key not configured. Add it in Admin > API Keys.' }, { status: 500 })
    }
    
    let productContext = ''
    if (product_id) {
      const { data: product } = await db
        .from('products')
        .select('*')
        .eq('id', product_id)
        .single()
      if (product) {
        productContext = `
Product: ${product.name}
Brand: ${product.brand}
Description: ${product.description}
Price: ${product.price_display}
Features: ${product.features?.join(', ')}
`
      }
    }
    
    let trendContext = ''
    if (trend_id) {
      const { data: trend } = await db
        .from('trends')
        .select('*')
        .eq('id', trend_id)
        .single()
      if (trend) {
        trendContext = `
Trending Topic: ${trend.keyword}
Description: ${trend.description}
Source: ${trend.source}
`
      }
    }
    
    const divisionInfo = ROSHANAL_BUSINESS_PROFILE.divisions[division as 'marine' | 'tech']
    
    const systemPrompt = `You are the dedicated content AI for ${ROSHANAL_BUSINESS_PROFILE.name}, based in Port Harcourt, Nigeria.

COMPANY: ${ROSHANAL_BUSINESS_PROFILE.name}
TAGLINE: ${ROSHANAL_BUSINESS_PROFILE.tagline}
DIVISION: ${divisionInfo.name}
PRODUCTS: ${divisionInfo.products.join(', ')}
TARGET: ${divisionInfo.target_customers.join(', ')}
USPs: ${divisionInfo.usps.join(', ')}

CONTACT (ALWAYS INCLUDE):
- Phone: ${ROSHANAL_BUSINESS_PROFILE.contact.phone}
- Email: ${ROSHANAL_BUSINESS_PROFILE.contact.email}
- Address: ${ROSHANAL_BUSINESS_PROFILE.contact.address}

BRAND VOICE: ${ROSHANAL_BUSINESS_PROFILE.brand_voice}

RULES:
1. Always include contact info in EVERY post
2. Use Nigerian English and local context (Port Harcourt, Niger Delta, PHCN, ₦ currency)
3. Drive to WhatsApp or phone calls — Nigeria is WhatsApp-first
4. Use relevant emojis for social posts
5. Create genuine urgency when appropriate
6. Write in natural Nigerian English where appropriate`

    const userPrompt = `Generate a ${post_type} social media post for the ${division} division.
Platform: ${platform}

${productContext}
${trendContext}

Requirements:
- Engaging caption with emojis
- Relevant hashtags (include #PortHarcourt #RiversState #NigeriaBusiness)
- Strong CTA to WhatsApp/call
- Keep it concise but impactful
- Match the ${post_type} style from these examples:
  * Product Spotlight: Feature specs, price, availability
  * Educational: Teach something valuable about the product/industry
  * Trend Reactive: Connect trending topic to our product
  * Problem-Solution: Present problem → our solution
  * Testimonial: Customer success story format
  
Output format:
CAPTION: [the post caption]
HASHTAGS: [comma-separated hashtags]
CTA: [call to action]`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: userPrompt }],
        system: systemPrompt
      }),
      signal: AbortSignal.timeout(30000)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Claude API error: ${errorText}` }, { status: 500 })
    }
    
    const aiData = await response.json()
    const generatedText = aiData.content?.[0]?.text || ''
    
    const captionMatch = generatedText.match(/CAPTION:\s*([\s\S]*?)(?=HASHTAGS:|$)/)
    const hashtagsMatch = generatedText.match(/HASHTAGS:\s*([\s\S]*?)(?=CTA:|$)/)
    const ctaMatch = generatedText.match(/CTA:\s*([\s\S]*?)$/)
    
    const caption = captionMatch?.[1]?.trim() || generatedText
    const hashtagsText = hashtagsMatch?.[1]?.trim() || ''
    const hashtags = hashtagsText.split(',').map((h: string) => h.trim().replace('#', '')).filter(Boolean)
    const cta = ctaMatch?.[1]?.trim() || 'Call/WhatsApp us today!'
    
    const post = {
      division,
      post_type,
      platform,
      caption,
      hashtags: ['PortHarcourt', 'RiversState', 'NigeriaBusiness', ...hashtags],
      cta,
      status: 'draft',
      auto_generated: true,
      product_id: product_id || null,
      trend_id: trend_id || null,
      created_at: new Date().toISOString()
    }
    
    const { data, error } = await db
      .from('social_posts')
      .insert(post)
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ post: data, raw_ai_response: generatedText })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
