import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { getApiKey } from '@/lib/env'

const db = new DBClient()

export async function POST(request: NextRequest) {
  try {
    const { division, ad_type, product_id, platform = 'instagram' } = await request.json()
    
    if (!division || !ad_type) {
      return NextResponse.json({ error: 'division and ad_type are required' }, { status: 400 })
    }
    
    const anthropicKey = await getApiKey('anthropic', 'Production Key')
    if (!anthropicKey) {
      return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 })
    }
    
    let productContext = ''
    if (product_id) {
      const { data: product } = await db
        .from('products')
        .select('*')
        .eq('id', product_id)
        .single()
      if (product) {
        productContext = `Product: ${product.name} by ${product.brand}\nDescription: ${product.description}\nPrice: ${product.price_display}`
      }
    }
    
    const systemPrompt = `You are the UGC Ad Creator AI for Roshanal Infotech Limited, Port Harcourt, Nigeria.

Company: Roshanal Infotech Limited
Contact: 08109522432 | 08033170802 | info@roshanalinfotech.com
Location: No 18A Rumuola/Rumuadaolu Road, Port Harcourt

Create compelling UGC ad content that drives WhatsApp inquiries.`
    
    const userPrompt = `Create a ${ad_type} ad for the ${division} division.
Platform: ${platform}
${productContext}

Output format:
HEADLINE: [catchy headline]
PRIMARY_TEXT: [main ad text - persuasive, benefit-focused]
CTA_BUTTON: [call to action text]
${platform === 'video' || ad_type.includes('Script') ? 'VIDEO_SCRIPT: [scene-by-scene script]' : ''}

Make it Nigerian-context relevant, urgent, and drive to WhatsApp/phone call.`
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
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
    
    const headlineMatch = generatedText.match(/HEADLINE:\s*([\s\S]*?)(?=PRIMARY_TEXT:|$)/)
    const primaryTextMatch = generatedText.match(/PRIMARY_TEXT:\s*([\s\S]*?)(?=CTA_BUTTON:|$)/)
    const ctaMatch = generatedText.match(/CTA_BUTTON:\s*([\s\S]*?)(?=VIDEO_SCRIPT:|$)/)
    const scriptMatch = generatedText.match(/VIDEO_SCRIPT:\s*([\s\S]*?)$/)
    
    const ad = {
      division,
      ad_type,
      platform,
      headline: headlineMatch?.[1]?.trim() || `${division} Ad`,
      primary_text: primaryTextMatch?.[1]?.trim() || generatedText,
      cta_button: ctaMatch?.[1]?.trim() || 'WhatsApp Us Now!',
      video_script: scriptMatch?.[1]?.trim() || null,
      status: 'draft',
      used_in_campaign: false,
      product_id: product_id || null,
      created_at: new Date().toISOString()
    }
    
    const { data, error } = await db
      .from('ugc_ads')
      .insert(ad)
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ ad: data, raw_ai_response: generatedText })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await db
      .from('ugc_ads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ads: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
