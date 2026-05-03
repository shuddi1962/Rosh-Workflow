import { NextRequest, NextResponse } from 'next/server'
import { getTriggerById, updateTrigger, deleteTrigger } from '@/lib/ai/socialAutoReply'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const trigger = getTriggerById(params.id)
  if (!trigger) {
    return NextResponse.json({ error: 'Trigger not found' }, { status: 404 })
  }
  return NextResponse.json({ trigger })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const trigger = updateTrigger(params.id, body)
    if (!trigger) {
      return NextResponse.json({ error: 'Trigger not found' }, { status: 404 })
    }
    return NextResponse.json({ trigger })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update trigger' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const success = deleteTrigger(params.id)
  if (!success) {
    return NextResponse.json({ error: 'Trigger not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
