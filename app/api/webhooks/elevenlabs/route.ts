import { NextResponse } from 'next/server'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversation_id, status, transcript, metadata } = body

    if (status === 'completed' && conversation_id) {
      const duration = metadata?.duration_seconds || 0
      const transcriptData = transcript || []

      await db
        .from('call_logs')
        .update({
          status: 'completed',
          duration_seconds: duration,
          transcript: transcriptData,
          ai_summary: generateSummary(transcriptData),
          ended_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversation_id)

      const { data: callLog } = await db
        .from('call_logs')
        .select('lead_id, agent_id')
        .eq('conversation_id', conversation_id)
        .single()

      if (callLog) {
        const callObj = callLog as unknown as Record<string, unknown>
        const leadId = callObj.lead_id as string
        const agentId = callObj.agent_id as string

        await db
          .from('voice_agents')
          .update({
            total_calls: (await getAgentCallCount(agentId)) + 1,
            avg_duration: await getAgentAvgDuration(agentId),
          })
          .eq('id', agentId)

        if (leadId) {
          await db
            .from('crm_activities')
            .insert({
              id: crypto.randomUUID(),
              lead_id: leadId,
              type: 'call_outbound',
              description: `Voice agent call completed (${duration}s)`,
              metadata: { conversation_id, duration, transcript_count: transcriptData.length },
              performed_by: 'ai_agent',
              call_id: conversation_id,
              created_at: new Date().toISOString(),
            })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error('ElevenLabs webhook error:', error)
    return NextResponse.json({ received: true }, { status: 200 })
  }
}

function generateSummary(transcript: Array<{ role: string; content: string }>): string {
  if (!transcript.length) return 'No transcript available'
  const exchanges = transcript.filter(t => t.role === 'user').length
  return `Conversation with ${exchanges} user exchanges`
}

async function getAgentCallCount(agentId: string): Promise<number> {
  const { data } = await db
    .from('call_logs')
    .select('id')
    .eq('agent_id', agentId)
    .eq('status', 'completed')
  return (data as unknown[] | null)?.length || 0
}

async function getAgentAvgDuration(agentId: string): Promise<number> {
  const { data } = await db
    .from('call_logs')
    .select('duration_seconds')
    .eq('agent_id', agentId)
    .eq('status', 'completed')
  if (!data || !(data as unknown[]).length) return 0
  const durations = (data as Array<Record<string, unknown>>).map(d => d.duration_seconds as number)
  return durations.reduce((a, b) => a + b, 0) / durations.length
}
