'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Phone, Plus, Loader2, Mic, Power } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'

interface VoiceAgent {
  id: string
  name: string
  type: string
  division: string
  is_active: boolean
  total_calls: number
  avg_duration: number
}

interface CallRecord {
  id: string
  agent_id: string
  status: string
  started_at: string
}

const DEFAULT_AGENTS: VoiceAgent[] = [
  { id: 'roshanal_inbound', name: 'Roshanal Customer Service', type: 'inbound', division: 'both', is_active: true, total_calls: 0, avg_duration: 0 },
  { id: 'roshanal_qualifier', name: 'Lead Qualifier', type: 'outbound', division: 'both', is_active: true, total_calls: 0, avg_duration: 0 },
  { id: 'roshanal_marine', name: 'Marine Products Specialist', type: 'outbound', division: 'marine', is_active: true, total_calls: 0, avg_duration: 0 },
  { id: 'roshanal_reengagement', name: 'Re-engagement Caller', type: 'outbound', division: 'both', is_active: true, total_calls: 0, avg_duration: 0 },
]

export default function VoiceAgentsPage() {
  const [agents, setAgents] = useState<VoiceAgent[]>(DEFAULT_AGENTS)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async (): Promise<void> => {
    try {
      const res = await fetch('/api/voice/agents')
      if (res.ok) {
        const data = await res.json() as { agents?: VoiceAgent[] }
        if (data.agents && data.agents.length > 0) setAgents(data.agents)
      }
    } catch {
      // Keep default agents on failure
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAgent = async (): Promise<void> => {
    setCreating(true)
    setError('')
    setNotice('')
    try {
      const res = await fetch('/api/voice/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `New Voice Agent ${agents.length + 1}`,
          type: 'outbound',
          division: 'both',
          is_active: true,
        }),
      })
      const data = await res.json() as { agent?: VoiceAgent; error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed to create agent')
      if (data.agent) {
        setAgents(prev => [data.agent as VoiceAgent, ...prev])
        setNotice('Voice agent created successfully.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleActive = (id: string): void => {
    setAgents(prev => prev.map(a => (a.id === id ? { ...a, is_active: !a.is_active } : a)))
  }

  const handleTestCall = async (agent: VoiceAgent): Promise<void> => {
    setTestingId(agent.id)
    setError('')
    setNotice('')
    try {
      const res = await fetch(`/api/voice/calls?agent_id=${encodeURIComponent(agent.id)}`)
      const data = await res.json() as { calls?: CallRecord[]; error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed to fetch call history')
      const count = data.calls?.length ?? 0
      setNotice(`${agent.name}: ${count} call${count === 1 ? '' : 's'} logged. Use a campaign to place new calls.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setTestingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Communication"
        title="Voice Agents"
        description="AI phone agents that call leads and follow up automatically."
        icon={Mic}
        actions={
          <button
            onClick={() => void handleCreateAgent()}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 text-sm font-medium disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Agent
          </button>
        }
      />

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-700 text-sm mb-6">
          {notice}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm mb-6">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white border border-border-subtle rounded-xl p-6 hover:border-accent-primary/40 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${agent.is_active ? 'bg-emerald-500' : 'bg-text-muted'}`} />
                  <div>
                    <h3 className="font-semibold text-text-primary">{agent.name}</h3>
                    <p className="text-sm text-text-secondary capitalize">{agent.type} · {agent.division}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-bg-surface text-text-muted'}`}>
                  {agent.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-text-secondary">Calls</p>
                  <p className="font-mono font-bold text-text-primary">{agent.total_calls}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Avg Duration</p>
                  <p className="font-mono font-bold text-text-primary">{agent.avg_duration}s</p>
                </div>
                <div>
                  <p className="text-text-secondary">Success</p>
                  <p className="font-mono font-bold text-text-primary">{agent.avg_duration > 0 ? '—' : '0%'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => void handleTestCall(agent)}
                  disabled={testingId === agent.id}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border-subtle rounded-lg text-sm hover:bg-bg-surface text-text-primary disabled:opacity-50"
                >
                  {testingId === agent.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                  Call History
                </button>
                <button
                  onClick={() => handleToggleActive(agent.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border-subtle rounded-lg text-sm hover:bg-bg-surface text-text-primary"
                >
                  <Power className="w-4 h-4" /> {agent.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-border-subtle rounded-xl p-6 mt-6">
        <h3 className="font-semibold text-text-primary mb-2">Outbound Call Campaign</h3>
        <p className="text-sm text-text-secondary mb-4">
          Voice call campaigns run from the campaigns hub — pick a lead list there and assign an agent.
        </p>
        <Link
          href="/dashboard/campaigns"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 text-sm font-medium"
        >
          <Phone className="w-4 h-4" /> Open Campaigns
        </Link>
      </div>
    </div>
  )
}
