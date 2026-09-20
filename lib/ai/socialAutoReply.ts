import { DEFAULT_KEYWORD_TRIGGERS, KeywordTrigger, AUTO_REPLY_MASTER_PROMPT } from '@/lib/social/auto-reply-config'
import { callClaude } from '@/lib/ai/claude'

export interface AutoReplyInput {
  platform: string
  triggerType: string
  incomingText: string
  customerName: string
  customerHandle?: string
  postId?: string
  metadata?: Record<string, unknown>
}

export interface AutoReplyResult {
  matched_trigger: KeywordTrigger | null
  used_ai: boolean
  reply_text: string
  intent: string
  sentiment: string
  priority: 'high' | 'medium' | 'low'
  follow_up_action: 'none' | 'send_dm' | 'create_lead' | 'notify_team'
  should_create_lead: boolean
  cost_usd: number
  latency_ms: number
}

export interface ReplyHistoryEntry {
  id: string
  platform: string
  trigger_type: string
  incoming_text: string
  customer_name: string
  customer_handle?: string
  reply_text: string
  matched_trigger_id: string | null
  used_ai: boolean
  intent: string
  sentiment: string
  priority: string
  created_at: string
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, '')
}

function matchKeywordTrigger(
  incomingText: string,
  platform: string,
  triggers?: KeywordTrigger[]
): KeywordTrigger | null {
  const normalized = normalizeText(incomingText)
  const activeTriggers = triggers || DEFAULT_KEYWORD_TRIGGERS

  for (const trigger of activeTriggers) {
    if (!trigger.is_active) continue
    if (trigger.platform !== 'all' && trigger.platform !== platform) continue

    for (const keyword of trigger.keywords) {
      if (normalized.includes(normalizeText(keyword))) {
        return trigger
      }
    }
  }

  return null
}

function renderTemplate(
  template: Record<string, string>,
  platform: string,
  customerName: string,
  customerHandle?: string
): string {
  let reply = template[platform] || template.default || ''
  reply = reply.replace(/\{\{name\}\}/g, customerName)
  reply = reply.replace(/\{\{handle\}\}/g, customerHandle || customerName)
  return reply
}

async function generateAIReply(
  input: AutoReplyInput
): Promise<{ text: string; cost_usd: number }> {
  const prompt = AUTO_REPLY_MASTER_PROMPT
    .replace(/\{\{platform\}\}/g, input.platform)
    .replace(/\{\{incoming_text\}\}/g, input.incomingText)
    .replace(/\{\{customer_name\}\}/g, input.customerName)

  const raw = await callClaude(prompt, { max_tokens: 500 })

  let parsed: { intent?: string; reply_text?: string; follow_up_action?: string; should_create_lead?: boolean; priority?: string; sentiment?: string; should_reply?: boolean }
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0])
    } else {
      parsed = {}
    }
  } catch {
    parsed = {}
  }

  if (!parsed.reply_text || !parsed.should_reply) {
    parsed.reply_text = `Hi ${input.customerName}! Thank you for reaching out to Roshanal Infotech. Our team will get back to you shortly. For immediate assistance, call/WhatsApp: 08109522432`
  }

  return { text: parsed.reply_text, cost_usd: 0.01 }
}

export async function processAutoReply(input: AutoReplyInput): Promise<AutoReplyResult> {
  const start = Date.now()

  const matched = matchKeywordTrigger(input.incomingText, input.platform)

  if (matched) {
    const reply = renderTemplate(
      matched.reply_template,
      input.platform,
      input.customerName,
      input.customerHandle
    )

    return {
      matched_trigger: matched,
      used_ai: false,
      reply_text: reply,
      intent: 'keyword_matched',
      sentiment: 'neutral',
      priority: 'medium',
      follow_up_action: matched.action as AutoReplyResult['follow_up_action'],
      should_create_lead: true,
      cost_usd: 0,
      latency_ms: Date.now() - start,
    }
  }

  const aiResult = await generateAIReply(input)
  const elapsed = Date.now() - start

  let intent = 'general_question'
  let sentiment = 'neutral'
  let priority: 'high' | 'medium' | 'low' = 'medium'
  let followUp: AutoReplyResult['follow_up_action'] = 'create_lead'

  const lower = input.incomingText.toLowerCase()
  if (lower.includes('price') || lower.includes('how much') || lower.includes('cost')) {
    intent = 'price_inquiry'
    priority = 'high'
  } else if (lower.includes('buy') || lower.includes('order') || lower.includes('purchase') || lower.includes('need')) {
    intent = 'order_intent'
    priority = 'high'
    followUp = 'send_dm'
  } else if (lower.includes('complaint') || lower.includes('problem') || lower.includes('issue') || lower.includes('not working') || lower.includes('broken')) {
    intent = 'complaint'
    priority = 'high'
    followUp = 'notify_team'
  } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('good')) {
    intent = 'greeting'
    priority = 'low'
  }

  return {
    matched_trigger: null,
    used_ai: true,
    reply_text: aiResult.text,
    intent,
    sentiment,
    priority,
    follow_up_action: followUp,
    should_create_lead: true,
    cost_usd: aiResult.cost_usd,
    latency_ms: elapsed,
  }
}

export function getActivePlatforms(): string[] {
  return DEFAULT_KEYWORD_TRIGGERS
    .filter(t => t.is_active)
    .map(t => t.platform)
    .filter((v, i, a) => a.indexOf(v) === i)
}

export function getAllTriggers(): KeywordTrigger[] {
  return DEFAULT_KEYWORD_TRIGGERS
}

export function updateTrigger(id: string, updates: Partial<KeywordTrigger>): KeywordTrigger | null {
  const trigger = DEFAULT_KEYWORD_TRIGGERS.find(t => t.id === id)
  if (!trigger) return null
  Object.assign(trigger, updates)
  return trigger
}

export function getTriggerById(id: string): KeywordTrigger | null {
  return DEFAULT_KEYWORD_TRIGGERS.find(t => t.id === id) || null
}

export function addTrigger(trigger: KeywordTrigger): KeywordTrigger {
  DEFAULT_KEYWORD_TRIGGERS.push(trigger)
  return trigger
}

export function deleteTrigger(id: string): boolean {
  const idx = DEFAULT_KEYWORD_TRIGGERS.findIndex(t => t.id === id)
  if (idx === -1) return false
  DEFAULT_KEYWORD_TRIGGERS.splice(idx, 1)
  return true
}
