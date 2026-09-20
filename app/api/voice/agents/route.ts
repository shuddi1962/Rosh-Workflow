import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'
import { createVoiceAgent, launchOutboundCall, getAvailableVoices } from '@/lib/voice/agent-manager'

const db = new DBClient()

export async function GET() {
  try {
    const { data, error } = await db
      .from('voice_agents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ agents: data || [] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const agentId = await createVoiceAgent(body)

    if (!agentId) {
      return NextResponse.json({ error: 'Failed to create voice agent' }, { status: 500 })
    }

    const { data, error } = await db
      .from('voice_agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ agent: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
