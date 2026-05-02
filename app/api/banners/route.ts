import { NextResponse } from 'next/server'
import { generateBanner, getBannerSizes, getBannerTypes, getStyles } from '@/lib/openrouter/banner-studio'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const division = searchParams.get('division')
    const saved = searchParams.get('saved')

    let query = db.from('generated_banners').select('*').order('created_at', { ascending: false })
    if (division) query = query.eq('division', division)
    if (saved === 'true') query = query.eq('is_saved', true)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ banners: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { division, banner_type, style, product_id, size, include_contact, text_overlay } = body

    const banner = await generateBanner({
      division,
      banner_type,
      style,
      prompt: text_overlay || '',
      product_id,
      size,
      include_contact: include_contact ?? true,
      include_logo: true,
      text_overlay,
    })

    if (!banner) {
      return NextResponse.json({ error: 'Failed to generate banner' }, { status: 500 })
    }

    const { data, error } = await db
      .from('generated_banners')
      .insert({
        id: banner.id,
        division,
        product_id,
        banner_type,
        style,
        prompt: banner.prompt,
        model: 'openrouter',
        image_url: banner.image_url,
        size: banner.size,
        format: banner.format,
        cost_usd: banner.cost_usd,
        is_saved: false,
        created_at: banner.created_at,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ banner: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
