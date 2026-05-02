import Anthropic from '@anthropic-ai/sdk'
import axios from 'axios'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null

export interface AIResponse {
  content: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
  cost_usd: number
}

export interface ContentGenerationParams {
  businessProfile: string
  productCatalog: string
  trends: string
  contentType: string
  division: 'marine' | 'tech'
  platform: string
  tone?: string
}

export interface CompetitorAnalysisParams {
  competitorData: string
  roshanalData: string
}

export interface TrendToContentParams {
  trend: string
  products: string
  division: 'marine' | 'tech'
}

const MASTER_CONTENT_PROMPT = `You are the AI marketing brain for Roshanal Infotech Limited, Port Harcourt, Nigeria.

COMPANY: Roshanal Infotech Limited
LOCATION: Port Harcourt, Rivers State, Nigeria
BRANCH: Yenegoa, Bayelsa State

DIVISIONS:
1. Marine: Outboard engines (Suzuki, Yamaha), fiberglass boats, marine gadgets, safety tools
2. Technology: Hikvision CCTV, solar systems, smart locks, car trackers, walkie-talkies, fire alarms

CONTACTS (ALWAYS INCLUDE IN POSTS):
- Phone: 08109522432 | 08033170802 | 08180388018
- Email: info@roshanalinfotech.com
- Address: No 18A Rumuola/Rumuadaolu Road, Port Harcourt

TARGET MARKETS:
- Marine: Oil & gas operators, commercial boat owners, fishermen, NDDC contractors
- Technology: Homeowners, businesses, banks, hotels, estates, fleet operators in Rivers/Bayelsa

BRAND VOICE: Expert, trusted, urgent, locally relevant, WhatsApp-friendly

ALWAYS:
- Include contact info in every post
- Reference local context (Port Harcourt, Niger Delta, PHCN, security incidents)
- Drive to WhatsApp or phone call — Nigeria is WhatsApp-first
- Use ₦ for prices, not $
- Write in natural Nigerian English where appropriate
- Include relevant emojis for social posts
- Create genuine urgency (stock, limited time, seasonal)`

export async function generateContent(params: ContentGenerationParams): Promise<AIResponse> {
  const prompt = `${MASTER_CONTENT_PROMPT}

BUSINESS PROFILE:
${params.businessProfile}

PRODUCT CATALOG:
${params.productCatalog}

CURRENT TRENDS:
${params.trends}

TASK: Generate ${params.contentType} content for ${params.division} division optimized for ${params.platform}.
TONE: ${params.tone || 'professional yet approachable'}

Generate the content now.`

  if (ANTHROPIC_API_KEY && anthropic) {
    return generateWithClaude(prompt)
  }
  
  if (OPENROUTER_API_KEY) {
    return generateWithOpenRouter(prompt, 'anthropic/claude-sonnet-4-20250514')
  }
  
  throw new Error('No AI provider configured')
}

async function generateWithClaude(prompt: string): Promise<AIResponse> {
  if (!anthropic) throw new Error('Claude client not initialized')
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  })
  
  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  const inputTokens = message.usage.input_tokens
  const outputTokens = message.usage.output_tokens
  const costUsd = (inputTokens * 3.0 + outputTokens * 15.0) / 1000000
  
  return { content, usage: { input_tokens: inputTokens, output_tokens: outputTokens }, cost_usd: costUsd }
}

async function generateWithOpenRouter(prompt: string, model: string): Promise<AIResponse> {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.7
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )
  
  const data = response.data
  const content = data.choices[0].message.content
  const inputTokens = data.usage?.prompt_tokens || 0
  const outputTokens = data.usage?.completion_tokens || 0
  const costUsd = 0.01
  
  return { content, usage: { input_tokens: inputTokens, output_tokens: outputTokens }, cost_usd: costUsd }
}

export async function analyzeCompetitors(params: CompetitorAnalysisParams): Promise<AIResponse> {
  const prompt = `You are a competitive intelligence analyst for Roshanal Infotech Limited.

You have been given scraped data from competitor social media accounts, websites, and Facebook ads.

Your job:
1. Identify what competitors are doing well that Roshanal is NOT doing
2. Find content gaps — topics they cover that Roshanal ignores
3. Analyze their ad angles — fear-based? savings-based? aspiration-based?
4. Identify the weaknesses in their strategy that Roshanal can exploit
5. Generate 10 specific, actionable content ideas Roshanal should create NOW
6. Rate each gap by urgency: critical (hurting sales now) / high / medium

COMPETITOR DATA:
${params.competitorData}

ROSHANAL DATA:
${params.roshanalData}

Output a structured JSON report with specific examples, not generic advice.`

  return generateWithClaude(prompt)
}

export async function bridgeTrendToContent(params: TrendToContentParams): Promise<AIResponse> {
  const prompt = `You receive live trending data relevant to Roshanal's business.

For each trend, determine:
1. Which Roshanal product/service is most relevant
2. What content angle to use (educational, promotional, problem-solution, news reactive)
3. Which platform would perform best for this type of content
4. Draft the actual post (caption, hashtags, CTA)
5. Rate the commercial opportunity (will this drive actual inquiries?)

Priority: Posts that combine a trending topic WITH a specific product WITH a clear CTA to WhatsApp/call score highest.

TREND:
${params.trend}

PRODUCTS:
${params.products}

DIVISION: ${params.division}

Local context first: Always ask — does this trend have a Port Harcourt / Niger Delta angle?`

  return generateWithClaude(prompt)
}

export async function callClaude(
  prompt: string,
  options: { max_tokens?: number; system?: string } = {}
): Promise<string> {
  const messages = options.system
    ? [
        { role: 'system' as const, content: options.system },
        { role: 'user' as const, content: prompt },
      ]
    : [{ role: 'user' as const, content: prompt }]

  if (ANTHROPIC_API_KEY && anthropic) {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: options.max_tokens || 4000,
      temperature: 0.7,
      system: options.system,
      messages: messages.filter(m => m.role !== 'system'),
    })
    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    return content
  }

  if (OPENROUTER_API_KEY) {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-sonnet-4-20250514',
        messages,
        max_tokens: options.max_tokens || 4000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    const content = response.data.choices[0].message.content
    return content
  }

  throw new Error('No AI provider configured')
}
