import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { insforgeAdmin } from '@/lib/insforge/client'
import { getApiKey } from '@/lib/env'

const ROSHANAL_BUSINESS_PROFILE = {
  name: "Roshanal Infotech Limited",
  tagline: "Your Trusted Partner for Marine & Technology Solutions",
  divisions: [
    {
      name: "Marine Division",
      products: ["Outboard Engines (Suzuki, Yamaha)", "Fiberglass Boats", "Marine Safety Tools", "Bilge Pumps"],
      target_customers: ["Oil & Gas companies", "Commercial boat operators", "Fishermen in Rivers State"],
      pain_points: ["Difficulty sourcing genuine parts", "No reliable fiberglass repair"],
      usps: ["Genuine Suzuki and Yamaha authorized", "Located in Port Harcourt"]
    },
    {
      name: "Technology & Surveillance Division",
      products: ["Hikvision CCTV", "Solar Systems", "Smart Door Locks", "Car Trackers"],
      target_customers: ["Homes in GRA Port Harcourt", "Banks", "Schools"],
      pain_points: ["Insecurity and armed robbery", "Epileptic PHCN power"],
      usps: ["Hikvision authorized dealer", "Same-day installation in PH"]
    }
  ],
  contact: {
    phone: "08109522432 | 08033170802 | 08180388018",
    email: "info@roshanalinfotech.com",
    address: "No 18A Rumuola/Rumuadaolu Road, Port Harcourt"
  }
}

export async function POST(request: NextRequest) {
  try {
    const { division, post_type, product_id, trend_id } = await request.json()
    
    const anthropicKey = await getApiKey('anthropic', 'Production Key')
    if (!anthropicKey) return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 })
    
    let productContext = ''
    if (product_id) {
      const { data: product } = await insforgeAdmin
        .database
        .from('products')
        .select('*')
        .eq('id', product_id)
        .single()
      if (product) productContext = `Product: ${product.name} - ${product.description}`
    }
    
    let trendContext = ''
    if (trend_id) {
      const { data: trend } = await insforgeAdmin
        .database
        .from('trends')
        .select('*')
        .eq('id', trend_id)
        .single()
      if (trend) trendContext = `Trending: ${trend.keyword} - ${trend.description}`
    }
    
    const systemPrompt = `You are the dedicated content AI for Roshanal Infotech Limited, Port Harcourt, Nigeria.
Company: ${ROSHANAL_BUSINESS_PROFILE.name}
Divisions: Marine (outboard engines, fiberglass boats, safety tools) & Tech (Hikvision CCTV, solar, smart locks, car trackers)
Contact: ${ROSHANAL_BUSINESS_PROFILE.contact.phone} | ${ROSHANAL_BUSINESS_PROFILE.contact.email}
Address: ${ROSHANAL_BUSINESS_PROFILE.contact.address}
Always include contact info in posts. Use Nigerian English. Drive to WhatsApp/phone calls.`
    
    const userPrompt = `Generate a ${post_type} social media post for the ${division} division.
${productContext}
${trendContext}
Include relevant emojis, hashtags, and a strong CTA to call/WhatsApp.`
    
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
      })
    })
    
    const aiData = await response.json()
    const generatedText = aiData.content?.[0]?.text || 'Content generation failed'
    
    const post = {
      division,
      post_type,
      platform: 'instagram',
      caption: generatedText,
      hashtags: ['#PortHarcourt', '#RiversState', '#NigeriaBusiness'],
      cta: 'Call/WhatsApp us today!',
      status: 'draft',
      auto_generated: true,
      product_id: product_id || null,
      trend_id: trend_id || null
    }
    
    const { data, error } = await insforgeAdmin
      .database
      .from('social_posts')
      .insert([post])
      .select()
      .single()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ post: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
