import { NextRequest, NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { processAutoReply, AutoReplyInput, AutoReplyResult, ReplyHistoryEntry } from '@/lib/ai/socialAutoReply'

const db = new DBClient()

interface WebhookPayload {
  platform: string
  triggerType: string
  incomingText: string
  customerName: string
  customerHandle?: string
  customerPhone?: string
  postId?: string
  metadata?: Record<string, unknown>
}

export async function POST(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const platform = params.platform
    const body = await request.json()

    const payload = parsePlatformPayload(platform, body)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid payload for platform', status: 200 })
    }

    const autoReplyEnabled = await isAutoReplyEnabled(platform)
    if (!autoReplyEnabled) {
      return NextResponse.json({ skipped: true, reason: 'auto-reply disabled for platform' })
    }

    const input: AutoReplyInput = {
      platform,
      triggerType: payload.triggerType,
      incomingText: payload.incomingText,
      customerName: payload.customerName,
      customerHandle: payload.customerHandle,
      postId: payload.postId,
      metadata: payload.metadata,
    }

    const result = await processAutoReply(input)

    await saveReplyHistory(platform, payload, result)

    if (result.should_create_lead && result.priority !== 'low') {
      await createLeadFromInteraction(platform, payload, result)
    }

    return NextResponse.json({
      platform,
      matched_trigger: result.matched_trigger?.id || null,
      used_ai: result.used_ai,
      reply_text: result.reply_text,
      intent: result.intent,
      priority: result.priority,
      follow_up: result.follow_up_action,
      created_lead: result.should_create_lead,
      cost_usd: result.cost_usd,
      latency_ms: result.latency_ms,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function parsePlatformPayload(platform: string, body: unknown): WebhookPayload | null {
  if (typeof body !== 'object' || body === null) return null
  const record = body as Record<string, unknown>
  switch (platform) {
    case 'whatsapp':
      return parseWhatsAppPayload(record)
    case 'instagram':
      return parseInstagramPayload(record)
    case 'facebook':
      return parseFacebookPayload(record)
    case 'twitter':
      return parseTwitterPayload(record)
    case 'telegram':
      return parseTelegramPayload(record)
    case 'linkedin':
      return parseLinkedInPayload(record)
    case 'tiktok':
      return parseTikTokPayload(record)
    case 'google_business':
      return parseGoogleBusinessPayload(record)
    default:
      return null
  }
}

function parseWhatsAppPayload(body: Record<string, unknown>): WebhookPayload | null {
  try {
    const entry = (body.entry as Array<Record<string, unknown>>)?.[0]
    const changes = (entry?.changes as Array<Record<string, unknown>>)?.[0]
    const value = changes?.value as Record<string, unknown>
    const messages = (value?.messages as Array<Record<string, unknown>>)?.[0]
    const contacts = (value?.contacts as Array<Record<string, unknown>>)?.[0]

    if (!messages || !contacts) return null

    const textObj = messages.text as Record<string, unknown> | undefined
    const incomingText = (textObj?.body as string) || ''
    const customerName = (contacts.profile as Record<string, unknown>)?.name as string || 'Customer'
    const customerPhone = messages.from as string

    return {
      platform: 'whatsapp',
      triggerType: 'message',
      incomingText,
      customerName,
      customerPhone,
      metadata: { message_id: messages.id, timestamp: messages.timestamp },
    }
  } catch {
    return null
  }
}

function parseInstagramPayload(body: Record<string, unknown>): WebhookPayload | null {
  try {
    const entry = (body.entry as Array<Record<string, unknown>>)?.[0]
    const messaging = (entry?.messaging as Array<Record<string, unknown>>)?.[0]

    if (!messaging) return null

    const message = messaging.message as Record<string, unknown>
    const sender = messaging.sender as Record<string, unknown>
    const text = message?.text as string || ''
    const senderId = sender?.id as string

    return {
      platform: 'instagram',
      triggerType: 'dm',
      incomingText: text,
      customerName: 'Instagram User',
      customerHandle: senderId,
      metadata: { sender_id: senderId, message_id: message?.mid },
    }
  } catch {
    return null
  }
}

function parseFacebookPayload(body: Record<string, unknown>): WebhookPayload | null {
  try {
    const entry = (body.entry as Array<Record<string, unknown>>)?.[0]
    const messaging = (entry?.messaging as Array<Record<string, unknown>>)?.[0]

    if (!messaging) return null

    const message = messaging.message as Record<string, unknown>
    const sender = messaging.sender as Record<string, unknown>
    const text = message?.text as string || ''

    return {
      platform: 'facebook',
      triggerType: 'message',
      incomingText: text,
      customerName: 'Facebook User',
      customerHandle: sender?.id as string,
      metadata: { sender_id: sender?.id },
    }
  } catch {
    return null
  }
}

function parseTwitterPayload(body: Record<string, unknown>): WebhookPayload | null {
  try {
    const forUserId = body.for_user_id as string
    const dmEvents = body.direct_message_events as Array<Record<string, unknown>> | undefined
    const directMessage = dmEvents?.[0]
    const messageData = directMessage?.message as Record<string, unknown>
    const text = (messageData?.message_data as Record<string, unknown>)?.text as string || ''
    const messageCreate = directMessage?.message_create as Record<string, unknown> | undefined
    const senderId = messageCreate?.sender_id as string

    if (!text && !body.text) return null

    return {
      platform: 'twitter',
      triggerType: forUserId ? 'mention' : 'dm',
      incomingText: text || (body.text as string) || '',
      customerName: 'Twitter User',
      customerHandle: senderId || (body.source_user_id as string),
      metadata: { tweet_id: body.id },
    }
  } catch {
    return null
  }
}

function parseTelegramPayload(body: Record<string, unknown>): WebhookPayload | null {
  try {
    const message = body.message as Record<string, unknown>
    if (!message) return null

    const text = message.text as string || ''
    const from = message.from as Record<string, unknown>
    const chat = message.chat as Record<string, unknown>
    const firstName = from?.first_name as string || 'Telegram User'
    const username = from?.username as string

    return {
      platform: 'telegram',
      triggerType: 'message',
      incomingText: text,
      customerName: firstName,
      customerHandle: username,
      metadata: { chat_id: chat?.id, message_id: message.message_id },
    }
  } catch {
    return null
  }
}

function parseLinkedInPayload(body: Record<string, unknown>): WebhookPayload | null {
  try {
    const message = body.message as Record<string, unknown>
    if (!message) return null

    const text = message.text as string || ''
    const senderId = message.senderId as string

    return {
      platform: 'linkedin',
      triggerType: 'message',
      incomingText: text,
      customerName: 'LinkedIn User',
      customerHandle: senderId,
      metadata: { urn: message.urn },
    }
  } catch {
    return null
  }
}

function parseTikTokPayload(body: Record<string, unknown>): WebhookPayload | null {
  try {
    const message = body.message as Record<string, unknown>
    if (!message) return null

    const text = message.content as string || message.text as string || ''
    const user = message.user as Record<string, unknown>

    return {
      platform: 'tiktok',
      triggerType: 'comment',
      incomingText: text,
      customerName: (user?.display_name as string) || 'TikTok User',
      customerHandle: user?.open_id as string,
      metadata: { comment_id: message.id },
    }
  } catch {
    return null
  }
}

function parseGoogleBusinessPayload(body: Record<string, unknown>): WebhookPayload | null {
  try {
    const review = body.review as Record<string, unknown>
    if (review) {
      const reviewer = review.reviewer as Record<string, unknown> | undefined
      return {
        platform: 'google_business',
        triggerType: 'review',
        incomingText: (review.comment as string) || '',
        customerName: (reviewer?.displayName as string) || 'Google User',
        metadata: { review_id: review.name, rating: review.starRating },
      }
    }

    const question = body.question as Record<string, unknown>
    if (question) {
      const author = question.author as Record<string, unknown> | undefined
      return {
        platform: 'google_business',
        triggerType: 'q_and_a',
        incomingText: (question.text as string) || '',
        customerName: (author?.displayName as string) || 'Google User',
        metadata: { question_id: question.name },
      }
    }

    return null
  } catch {
    return null
  }
}

async function isAutoReplyEnabled(platform: string): Promise<boolean> {
  try {
    const { data, error } = await db
      .from('feature_toggles')
      .select('is_enabled')
      .eq('feature_key', `auto_reply_${platform}`)
      .single()

    if (error) return true
    const row = data as Record<string, unknown> | null
    return row?.is_enabled as boolean ?? true
  } catch {
    return true
  }
}

async function saveReplyHistory(
  platform: string,
  payload: WebhookPayload,
  result: AutoReplyResult
): Promise<void> {
  try {
    await db.from('social_auto_replies').insert({
      platform,
      trigger_type: payload.triggerType,
      incoming_text: payload.incomingText.substring(0, 500),
      customer_name: payload.customerName,
      customer_handle: payload.customerHandle,
      reply_text: result.reply_text.substring(0, 1000),
      matched_trigger_id: result.matched_trigger?.id || null,
      used_ai: result.used_ai,
      intent: result.intent,
      sentiment: result.sentiment,
      priority: result.priority,
      cost_usd: result.cost_usd,
      latency_ms: result.latency_ms,
      created_at: new Date().toISOString(),
    })
  } catch {
  }
}

async function createLeadFromInteraction(
  platform: string,
  payload: WebhookPayload,
  result: AutoReplyResult
): Promise<void> {
  try {
    const sourceMap: Record<string, string> = {
      whatsapp: 'whatsapp_inbound',
      instagram: 'instagram_dm',
      facebook: 'facebook_message',
      twitter: 'manual',
      telegram: 'manual',
      linkedin: 'manual',
      tiktok: 'manual',
      google_business: 'manual',
    }

    await db.from('leads').insert({
      full_name: payload.customerName,
      phone: payload.customerPhone || '',
      email: '',
      company: '',
      location: 'Port Harcourt, Rivers State',
      division_interest: 'both',
      product_interests: [],
      source: sourceMap[platform] || 'manual',
      source_detail: `Auto-reply from ${platform}`,
      stage: 'new_lead',
      score: result.priority === 'high' ? 80 : result.priority === 'medium' ? 50 : 20,
      tier: result.priority === 'high' ? 'hot' : result.priority === 'medium' ? 'warm' : 'cold',
      tags: [platform, `auto_reply_${result.intent}`],
      notes: `Auto-generated from ${platform} interaction. Intent: ${result.intent}. Used AI: ${result.used_ai}`,
      next_action: 'contact_via_whatsapp',
      next_action_type: 'whatsapp',
      next_action_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      opted_out: false,
    })
  } catch {
  }
}
