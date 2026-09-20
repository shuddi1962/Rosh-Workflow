import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { OPENROUTER_IMAGE_MODELS } from '@/lib/openrouter/imageClient'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, aspect_ratio, num_images } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }
    
    const { generateImage } = await import('@/lib/openrouter/imageClient')
    const images = await generateImage(
      prompt,
      model || 'google/gemini-flash-3.1-image-preview',
      { aspect_ratio, num_images }
    )
    
    return NextResponse.json({ images })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const models = Object.entries(OPENROUTER_IMAGE_MODELS).map(([id, config]) => ({
      id,
      ...config,
    }))
    
    return NextResponse.json({ models })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
