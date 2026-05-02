import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { launchOutboundCall } from '@/lib/voice/agent-manager'

const db = new DBClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agent_id')
    const leadId = searchParams.get('lead_id')

    let query = db.from('call_logs').select('*').order('started_at', { ascending: false })
    if (agentId) query = query.eq('agent_id', agentId)
    if (leadId) query = query.eq('lead_id', leadId)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ calls: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { agent_id, lead_id, phone_number } = body

    if (!agent_id || !lead_id || !phone_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const now = new Date()
    const hour = now.getHours()
    if (hour < 9 || hour >= 20) {
      return NextResponse.json({
        error: 'Outbound calls can only be made between 9AM-8PM WAT',
        current_hour: hour,
      }, { status: 400 })
    }

    const result = await launchOutboundCall({ agent_id, lead_id, phone_number })

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to initiate call' }, { status: 500 })
    }

    return NextResponse.json({ success: true, call_sid: result.call_sid })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
