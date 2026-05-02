import { NextRequest, NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await db
      .from('crm_activities')
      .select('*')
      .eq('lead_id', params.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ activities: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const activity = {
      id: crypto.randomUUID(),
      lead_id: params.id,
      type: body.type || 'note_added',
      description: body.description || '',
      metadata: body.metadata || {},
      performed_by: body.performed_by || 'system',
      campaign_id: body.campaign_id || null,
      call_id: body.call_id || null,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await db.from('crm_activities').insert(activity)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ activity: data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
