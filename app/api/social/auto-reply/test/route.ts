import { NextRequest, NextResponse } from 'next/server'
import { processAutoReply } from '@/lib/ai/socialAutoReply'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, incomingText, customerName, customerHandle } = body

    if (!platform || !incomingText || !customerName) {
      return NextResponse.json(
        { error: 'platform, incomingText, and customerName are required' },
        { status: 400 }
      )
    }

    const result = await processAutoReply({
      platform,
      triggerType: body.triggerType || 'comment',
      incomingText,
      customerName,
      customerHandle: customerHandle || customerName,
    })

    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process auto-reply test', details: (error as Error).message },
      { status: 500 }
    )
  }
}
