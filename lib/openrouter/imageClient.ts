import { OPENROUTER_IMAGE_MODELS } from './models'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export interface OpenRouterImageRequest {
  model: string
  messages: { role: 'user'; content: string }[]
  modalities: ['image', 'text'] | ['image']
  image_config?: {
    width?: number
    height?: number
    aspect_ratio?: string
    num_images?: number
    quality?: 'standard' | 'hd'
  }
}

export interface OpenRouterImageResponse {
  choices: {
    message: {
      content: Array<
        | { type: 'text'; text: string }
        | { type: 'image_url'; image_url: { url: string } }
      >
    }
  }[]
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

export async function generateImage(
  prompt: string,
  model: string,
  config?: {
    aspect_ratio?: string
    num_images?: number
    width?: number
    height?: number
  }
): Promise<{ url: string; model: string; prompt: string; aspect_ratio: string }[]> {
  const { getApiKey } = await import('@/lib/env')
  const { DBClient } = await import('@/lib/insforge/server')
  const apiKey = await getApiKey('openrouter', 'Production Key')
  
  if (!apiKey) throw new Error('OpenRouter API key not configured')
  
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL!,
      'X-Title': 'Roshanal AI Creative Studio',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      modalities: ['image', 'text'],
      image_config: {
        aspect_ratio: config?.aspect_ratio ?? '1:1',
        num_images: config?.num_images ?? 1,
        width: config?.width,
        height: config?.height,
      },
    }),
    signal: AbortSignal.timeout(60000)
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${error}`)
  }
  
  const data: OpenRouterImageResponse = await response.json()
  
  const images: { url: string; model: string; prompt: string; aspect_ratio: string }[] = []
  
  for (const choice of data.choices) {
    for (const part of choice.message.content) {
      if (part.type === 'image_url') {
        images.push({
          url: part.image_url.url,
          model,
          prompt,
          aspect_ratio: config?.aspect_ratio ?? '1:1',
        })
      }
    }
  }
  
  const db = new DBClient()
  for (const img of images) {
    await db.from('generated_images').insert({
      prompt,
      model,
      model_label: OPENROUTER_IMAGE_MODELS[model as keyof typeof OPENROUTER_IMAGE_MODELS]?.label || model,
      image_url: img.url,
      aspect_ratio: img.aspect_ratio,
      status: 'ready',
      created_at: new Date().toISOString(),
    })
  }
  
  return images
}

export function calculateOpenRouterCost(model: string, usage: { total_tokens: number }): number {
  const costMap: Record<string, number> = {
    'google/gemini-3-pro-image-preview': 0.06,
    'google/gemini-flash-3.1-image-preview': 0.03,
    'google/gemini-2.5-flash-preview': 0.015,
    'black-forest-labs/flux-2-pro': 0.04,
    'black-forest-labs/flux-2': 0.015,
    'openai/gpt-image-1': 0.05,
    'bytedance/seedream-4.5': 0.04,
    'xai/grok-2-image': 0.04,
  }
  return (costMap[model] || 0.02) * (usage.total_tokens / 1000)
}

export { OPENROUTER_IMAGE_MODELS }
