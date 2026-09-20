import { NextRequest, NextResponse } from 'next/server'
import { qualifyLead } from '@/lib/ai/qualification-engine'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await qualifyLead(params.id)
    if (!result) return NextResponse.json({ error: 'Qualification failed' }, { status: 500 })

    return NextResponse.json({ result })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
