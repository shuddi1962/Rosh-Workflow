import { NextRequest, NextResponse } from 'next/server'
import { getAllTriggers, getTriggerById, addTrigger, updateTrigger, deleteTrigger } from '@/lib/ai/socialAutoReply'

export async function GET() {
  const triggers = getAllTriggers()
  return NextResponse.json({ triggers })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const trigger = {
      id: body.id || `trigger-${Date.now()}`,
      keywords: body.keywords || [],
      platform: body.platform || 'all',
      reply_template: body.reply_template || {},
      action: body.action || 'none',
      tag_product: body.tag_product || '',
      is_active: body.is_active !== false,
      fire_count: 0,
    }

    if (trigger.keywords.length === 0) {
      return NextResponse.json({ error: 'At least one keyword is required' }, { status: 400 })
    }

    addTrigger(trigger)
    return NextResponse.json({ trigger }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create trigger' }, { status: 500 })
  }
}
