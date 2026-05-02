import { NextRequest, NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: lead, error } = await db
      .from('leads')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const { data: activities } = await db
      .from('crm_activities')
      .select('*')
      .eq('lead_id', params.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ lead, activities: activities || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const { data, error } = await db
      .from('leads')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ lead: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await db.from('leads').delete().eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
