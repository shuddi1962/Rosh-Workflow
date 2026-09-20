import { NextRequest, NextResponse } from 'next/server'
import { qualifyAllPending } from '@/lib/ai/qualification-engine'

export async function POST() {
  try {
    const result = await qualifyAllPending()
    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
