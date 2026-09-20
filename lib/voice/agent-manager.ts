import { DBClient } from '@/lib/insforge/server'
import { createElevenLabsAgent, makeOutboundCall, getConversationDetails, listVoices } from '@/lib/elevenlabs/client'

const db = new DBClient()

export interface VoiceAgentConfig {
  id?: string
  name: string
  type: 'inbound' | 'outbound'
  division: 'marine' | 'tech' | 'both'
  voice_id: string
  system_prompt: string
  first_message: string
  is_active?: boolean
}

export const ROSHANAL_VOICE_AGENTS: Omit<VoiceAgentConfig, 'voice_id'>[] = [
  {
    name: 'Marine Sales Agent',
    type: 'outbound',
    division: 'marine',
    system_prompt: `You are a sales representative for Roshanal Infotech Limited — Marine Division.
Location: Port Harcourt, Rivers State, Nigeria.
Products: Suzuki and Yamaha outboard engines (15HP-300HP), fiberglass boats, marine safety equipment.

Your job: Qualify leads, answer questions about marine equipment, schedule boat inspections, and book demo calls.
Always mention: "We are located at No 18A Rumuola/Rumuadaolu Road, Port Harcourt. Call 08109522432."
Speak in friendly Nigerian English. Be direct about pricing and availability.
If they mention engine problems, offer immediate consultation.`,
    first_message: "Hello! This is Roshanal Infotech Marine Division calling. I'm your AI assistant. How can I help you with your marine equipment needs today?",
  },
  {
    name: 'Tech Security Agent',
    type: 'outbound',
    division: 'tech',
    system_prompt: `You are a sales representative for Roshanal Infotech Limited — Technology & Surveillance Division.
Location: Port Harcourt, Rivers State, Nigeria.
Products: Hikvision CCTV, solar systems, car trackers, smart door locks, fire alarms.

Your job: Qualify leads, explain security solutions, handle objections about PHCN outages, and book site surveys.
Always mention: "We serve the entire Niger Delta region. Call 08109522432 for same-day installation."
Speak in friendly Nigerian English. Emphasize security and power backup benefits.
If they mention robbery or theft, show urgency and offer immediate solutions.`,
    first_message: "Hello! This is Roshanal Infotech Technology Division. I'm calling about securing your property. How can I help you today?",
  },
  {
    name: 'Inbound Receptionist',
    type: 'inbound',
    division: 'both',
    system_prompt: `You are the receptionist AI for Roshanal Infotech Limited, Port Harcourt.
You handle ALL incoming calls for both Marine and Technology divisions.

Your job:
1. Greet callers warmly in Nigerian English
2. Identify if they need marine equipment or tech/security solutions
3. Answer basic questions (location: 18A Rumuola Road, Phone: 08109522432)
4. Transfer to human agent for complex queries
5. Take messages with contact details for callbacks

Be polite, professional, and efficient. Always offer WhatsApp as alternative: "You can also WhatsApp us at 08109522432."`,
    first_message: "Thank you for calling Roshanal Infotech Limited, Port Harcourt. This is your AI assistant. Are you calling about marine equipment or technology solutions today?",
  },
]

export async function createVoiceAgent(config: VoiceAgentConfig): Promise<string | null> {
  try {
    const elevenlabsResult = await createElevenLabsAgent({
      name: config.name,
      voice_id: config.voice_id,
      system_prompt: config.system_prompt,
      first_message: config.first_message,
    })

    if (!elevenlabsResult) return null

    const agentData = {
      id: config.id || crypto.randomUUID(),
      name: config.name,
      type: config.type,
      division: config.division,
      elevenlabs_agent_id: elevenlabsResult.agent_id,
      voice_id: config.voice_id,
      system_prompt: config.system_prompt,
      first_message: config.first_message,
      is_active: config.is_active ?? true,
      total_calls: 0,
      avg_duration: 0,
      success_rate: 0,
      created_at: new Date().toISOString(),
    }

    const { error } = await db.from('voice_agents').insert(agentData)
    if (error) return null

    return agentData.id
  } catch {
    return null
  }
}

export async function launchOutboundCall(params: {
  agent_id: string
  lead_id: string
  phone_number: string
}): Promise<{ success: boolean; call_sid?: string; error?: string }> {
  try {
    const { data: agent } = await db
      .from('voice_agents')
      .select('*')
      .eq('id', params.agent_id)
      .single()

    if (!agent) return { success: false, error: 'Agent not found' }

    const agentObj = agent as unknown as Record<string, unknown>
    const result = await makeOutboundCall({
      agent_id: agentObj.elevenlabs_agent_id as string,
      to_number: params.phone_number,
    })

    if (!result) return { success: false, error: 'Failed to initiate call' }

    await db.from('call_logs').insert({
      id: crypto.randomUUID(),
      lead_id: params.lead_id,
      agent_id: params.agent_id,
      call_sid: result.call_id,
      conversation_id: result.call_id,
      type: 'outbound',
      from_number: 'system',
      to_number: params.phone_number,
      duration_seconds: 0,
      status: 'initiated',
      outcome: 'callback',
      transcript: [],
      ai_summary: '',
      key_points: [],
      next_action: 'Wait for call to complete',
      audio_url: '',
      started_at: new Date().toISOString(),
      ended_at: '',
      created_at: new Date().toISOString(),
    })

    return { success: true, call_sid: result.call_id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function processCallTranscript(conversationId: string): Promise<void> {
  try {
    const details = await getConversationDetails(conversationId)
    if (!details) return

    const transcriptText = details.transcript
      .map(t => `${t.role}: ${t.content}`)
      .join('\n')

    await db
      .from('call_logs')
      .update({
        transcript: details.transcript,
        ai_summary: `Conversation with ${details.transcript.length} exchanges`,
        status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
  } catch {
    console.error('Failed to process call transcript')
  }
}

export async function getAvailableVoices() {
  return await listVoices()
}
