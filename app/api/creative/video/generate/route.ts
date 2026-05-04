import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { getApiKey } from '@/lib/env'

const db = new DBClient()

const KIE_BASE_URL = 'https://api.kie.ai/api/v1'

export async function POST(request: NextRequest) {
  try {
    const { prompt, imageUrls, model, aspect_ratio, callbackUrl } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }
    
    const key = await getApiKey('kie_ai', 'API Key')
    if (!key) {
      return NextResponse.json({ error: 'Kie.ai API key not configured' }, { status: 500 })
    }
    
    const res = await fetch(`${KIE_BASE_URL}/veo/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        imageUrls: imageUrls ?? [],
        model: model || 'veo3-fast',
        watermark: '',
        callBackUrl: callbackUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/kie`,
        aspect_ratio: aspect_ratio ?? '9:16',
        enableFallback: true,
        generationType: imageUrls?.length ? 'REFERENCE_2_VIDEO' : 'TEXT_2_VIDEO',
      }),
      signal: AbortSignal.timeout(30000)
    })
    
    const data = await res.json()
    if (!data.data?.taskId) {
      return NextResponse.json({ error: `Veo generation failed: ${JSON.stringify(data)}` }, { status: 500 })
    }
    
    await db
      .from('video_tasks')
      .insert({
        kie_task_id: data.data.taskId,
        model: model || 'veo3-fast',
        prompt,
        status: 'PENDING',
        type: 'veo',
        created_at: new Date().toISOString(),
      })
    
    return NextResponse.json({ taskId: data.data.taskId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('video_tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ tasks: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
