import { NextRequest, NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { stage } = body

    if (!stage) return NextResponse.json({ error: 'Stage is required' }, { status: 400 })

    const { data: lead } = await db
      .from('leads')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const leadObj = lead as unknown as Record<string, unknown>

    await db
      .from('leads')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    await db
      .from('crm_activities')
      .insert({
        id: crypto.randomUUID(),
        lead_id: params.id,
        type: 'stage_changed',
        description: `Stage changed from ${leadObj.stage} to ${stage}`,
        metadata: { from: leadObj.stage, to: stage },
        performed_by: 'system',
        created_at: new Date().toISOString(),
      })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
