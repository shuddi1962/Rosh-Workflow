import { getApiKey } from '@/lib/env'

const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1'

export interface VoiceAgent {
  id: string
  name: string
  type: 'inbound' | 'outbound'
  division: 'marine' | 'tech' | 'both'
  elevenlabs_agent_id: string
  voice_id: string
  system_prompt: string
  first_message: string
  is_active: boolean
  total_calls: number
  avg_duration: number
  success_rate: number
  created_at: string
}

export async function getElevenLabsKey(): Promise<string | null> {
  return getApiKey('elevenlabs', 'API Key')
}

export async function createElevenLabsAgent(config: {
  name: string
  voice_id: string
  system_prompt: string
  first_message: string
}): Promise<{ agent_id: string } | null> {
  const apiKey = await getElevenLabsKey()
  if (!apiKey) return null

  const response = await fetch(`${ELEVENLABS_BASE}/convai/agents/create`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: config.name,
      conversation_config: {
        tts: { voice_id: config.voice_id },
        agent: {
          prompt: { prompt: config.system_prompt },
          first_message: config.first_message,
        },
      },
    }),
  })

  if (!response.ok) return null
  const data = await response.json()
  return { agent_id: data.agent_id }
}

export async function makeOutboundCall(params: {
  agent_id: string
  to_number: string
  from_number?: string
}): Promise<{ call_id: string } | null> {
  const apiKey = await getElevenLabsKey()
  if (!apiKey) return null

  const response = await fetch(`${ELEVENLABS_BASE}/convai/twilio/outbound-call`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_id: params.agent_id,
      to_number: params.to_number,
      from_number: params.from_number,
    }),
  })

  if (!response.ok) return null
  const data = await response.json()
  return { call_id: data.call_id }
}

export async function getConversationDetails(conversationId: string): Promise<{
  transcript: Array<{ role: string; content: string; timestamp: string }>
  metadata: Record<string, unknown>
} | null> {
  const apiKey = await getElevenLabsKey()
  if (!apiKey) return null

  const response = await fetch(
    `${ELEVENLABS_BASE}/convai/conversations/${conversationId}`,
    { headers: { 'xi-api-key': apiKey } }
  )

  if (!response.ok) return null
  return await response.json()
}

export async function listVoices(): Promise<Array<{ voice_id: string; name: string }>> {
  const apiKey = await getElevenLabsKey()
  if (!apiKey) return []

  const response = await fetch(`${ELEVENLABS_BASE}/voices`, {
    headers: { 'xi-api-key': apiKey },
  })

  if (!response.ok) return []
  const data = await response.json()
  return data.voices || []
}
