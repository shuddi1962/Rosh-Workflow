import { NextRequest, NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

interface AutoReplySettings {
  response_delay: 'instant' | 'human' | 'custom'
  custom_delay_seconds?: number
  ai_model: string
  language: string
  tone: string
  auto_create_lead: boolean
  notify_negative_sentiment: boolean
  notify_order_intent: boolean
  master_kill_switch: boolean
  daily_ai_budget_usd: number
  human_handoff_rules: {
    complaint: boolean
    multiple_messages: boolean
    order_intent: boolean
    low_confidence: boolean
    after_hours: boolean
  }
  notify_channels: {
    push: boolean
    sms: boolean
    email: boolean
  }
  after_hours_start: string
  after_hours_end: string
}

export async function GET() {
  try {
    const { data, error } = await db
      .from('feature_toggles')
      .select('*')
      .eq('feature_key', 'auto_reply_settings')

    if (error || !data || (data as unknown[]).length === 0) {
      return NextResponse.json({
        settings: {
          response_delay: 'human',
          ai_model: 'claude-sonnet',
          language: 'english',
          tone: 'professional',
          auto_create_lead: true,
          notify_negative_sentiment: true,
          notify_order_intent: true,
          master_kill_switch: false,
          daily_ai_budget_usd: 5,
          human_handoff_rules: {
            complaint: true,
            multiple_messages: true,
            order_intent: true,
            low_confidence: true,
            after_hours: true,
          },
          notify_channels: {
            push: true,
            sms: true,
            email: true,
          },
          after_hours_start: '22:00',
          after_hours_end: '07:00',
        },
      })
    }

    const row = (data as Record<string, unknown>[])?.[0]
    const settings = (row?.value as string) ? JSON.parse(row.value as string) : {}

    return NextResponse.json({ settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const settings = body as AutoReplySettings

    const { data: existing } = await db
      .from('feature_toggles')
      .select('*')
      .eq('feature_key', 'auto_reply_settings')
      .single()

    if (existing) {
      const { data, error } = await db
        .from('feature_toggles')
        .update({
          value: JSON.stringify(settings),
          updated_by: 'system',
          updated_at: new Date().toISOString(),
        })
        .eq('feature_key', 'auto_reply_settings')
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ settings, toggle: data })
    } else {
      const { data, error } = await db
        .from('feature_toggles')
        .insert({
          feature_key: 'auto_reply_settings',
          is_enabled: true,
          value: JSON.stringify(settings),
          updated_by: 'system',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ settings, toggle: data })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update settings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
