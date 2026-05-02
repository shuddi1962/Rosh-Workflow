import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const POLLINATIONS_URL = 'https://image.pollinations.ai/prompt/'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { prompt, width = 1024, height = 1024, seed = Math.floor(Math.random() * 999999) } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const encodedPrompt = encodeURIComponent(prompt)
    const imageUrl = `${POLLINATIONS_URL}${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`

    return NextResponse.json({ 
      success: true,
      image_url: imageUrl,
      prompt,
      seed
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const prompt = searchParams.get('prompt')

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const encodedPrompt = encodeURIComponent(prompt)
    const seed = searchParams.get('seed') || Math.floor(Math.random() * 999999)
    const width = searchParams.get('width') || 1024
    const height = searchParams.get('height') || 1024

    const imageUrl = `${POLLINATIONS_URL}${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`

    return NextResponse.json({ 
      success: true,
      image_url: imageUrl,
      prompt
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
