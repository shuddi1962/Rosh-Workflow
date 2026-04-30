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
  const { insforgeAdmin } = await import('@/lib/insforge/client')
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
  
  await insforgeAdmin
    .database
    .from('generated_images')
    .insert(images.map(img => ({
      prompt,
      model,
      model_label: OPENROUTER_IMAGE_MODELS[model]?.label || model,
      image_url: img.url,
      aspect_ratio: img.aspect_ratio,
      status: 'ready',
      created_at: new Date().toISOString(),
    })))
  
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

export const OPENROUTER_IMAGE_MODELS = {
  'google/gemini-3-pro-image-preview': {
    label: 'Gemini 3 Pro',
    description: 'Highest quality. Best for influencer avatars, complex product scenes, 2K/4K output.',
    best_for: ['influencer', 'product_hero', 'campaign_poster'],
    supports_image_input: true,
    max_images: 8,
    aspect_ratios: ['1:1', '16:9', '9:16', '4:5', '3:2'],
    cost_tier: 'premium',
    openrouter_id: 'google/gemini-3-pro-image-preview',
    approx_cost_per_image: '$0.04-0.08',
    supports_web_search: true,
    strengths: [
      'Identity preservation across multiple images (consistent influencer character)',
      'Text rendering in images (product names, prices, CTAs)',
      'Precise localized edits',
      'Up to 14 reference images in context',
      'Real-world grounding via search',
    ],
  },
  'google/gemini-flash-3.1-image-preview': {
    label: 'Gemini 2 Flash',
    description: 'Pro-level quality at Flash speed. Best balance for most use cases.',
    best_for: ['social_post', 'product_showcase', 'influencer', 'ugc_thumbnail'],
    supports_image_input: true,
    max_images: 14,
    aspect_ratios: ['1:1', '16:9', '9:16', '4:5'],
    cost_tier: 'standard',
    openrouter_id: 'google/gemini-flash-3.1-image-preview',
    approx_cost_per_image: '$0.02-0.04',
    strengths: [
      'Fast generation (10-15s)',
      'Character consistency across multiple images',
      'Multilingual text in images',
      'Multi-image blending (combine product + model)',
    ],
  },
  'google/gemini-2.5-flash-preview': {
    label: 'Gemini 2.5 Flash',
    description: 'Fast, cost-efficient. Great for bulk content calendar generation.',
    best_for: ['bulk_generation', 'social_post', 'quick_mockup'],
    supports_image_input: true,
    max_images: 4,
    aspect_ratios: ['1:1', '16:9', '9:16'],
    cost_tier: 'budget',
    openrouter_id: 'google/gemini-2.5-flash-preview',
    approx_cost_per_image: '$0.01-0.02',
    strengths: ['Speed', 'Cost efficiency', 'Good for iterating many variations'],
  },
  'black-forest-labs/flux-2-pro': {
    label: 'Flux 2 Pro',
    description: 'Vivid colors, coherent complex scenes. Best for product hero shots.',
    best_for: ['product_hero', 'e-commerce', 'lifestyle_shot'],
    supports_image_input: true,
    aspect_ratios: ['1:1', '16:9', '9:16', '4:5', '3:4', '2:3'],
    cost_tier: 'standard',
    openrouter_id: 'black-forest-labs/flux-2-pro',
    approx_cost_per_image: '$0.03-0.05',
    strengths: [
      'Photorealistic product renders',
      'Strong subject consistency',
      'Clean backgrounds ideal for product shots',
      'High detail fidelity',
    ],
  },
  'black-forest-labs/flux-2': {
    label: 'Flux 2 (Standard)',
    description: 'Efficient version of Flux 2. Good quality at lower cost.',
    best_for: ['social_post', 'product_mockup'],
    supports_image_input: true,
    aspect_ratios: ['1:1', '16:9', '9:16'],
    cost_tier: 'budget',
    openrouter_id: 'black-forest-labs/flux-2',
    approx_cost_per_image: '$0.01-0.02',
    strengths: ['Reliable quality', 'Fast', 'Cost effective for bulk'],
  },
  'openai/gpt-image-1': {
    label: 'GPT Image 1',
    description: 'OpenAI\'s image model. Excellent text rendering inside images, great for ads with copy.',
    best_for: ['ad_creative', 'text_in_image', 'infographic', 'product_with_price'],
    supports_image_input: true,
    aspect_ratios: ['1:1', '16:9', '9:16'],
    cost_tier: 'standard',
    openrouter_id: 'openai/gpt-image-1',
    approx_cost_per_image: '$0.04-0.06',
    strengths: [
      'Best-in-class text rendering (prices, CTAs, product names in image)',
      'High instruction following',
      'Clean ad-style outputs',
      'Edits existing images precisely',
    ],
  },
  'bytedance/seedream-4.5': {
    label: 'Seedream 4.5',
    description: 'ByteDance model. Excellent portrait refinement and lifestyle images.',
    best_for: ['influencer_portrait', 'lifestyle', 'fashion'],
    supports_image_input: true,
    aspect_ratios: ['1:1', '16:9', '9:16', '4:5'],
    cost_tier: 'budget',
    openrouter_id: 'bytedance/seedream-4.5',
    approx_cost_per_image: '$0.04',
    strengths: [
      'Portrait refinement (smooth, realistic skin)',
      'Multi-image composition',
      'Consistent character across renders',
      'Small text rendering',
    ],
  },
  'xai/grok-2-image': {
    label: 'Grok 2 Image',
    description: 'xAI model. Strong realism and diverse creative styles.',
    best_for: ['creative_campaign', 'artistic_ad'],
    supports_image_input: true,
    aspect_ratios: ['1:1', '16:9', '9:16'],
    cost_tier: 'standard',
    openrouter_id: 'xai/grok-2-image',
    approx_cost_per_image: '$0.03-0.05',
    strengths: ['High realism', 'Style versatility', 'Strong scene understanding'],
  },
}
