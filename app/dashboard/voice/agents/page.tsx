'use client'

import { useState } from 'react'
import { Phone, Plus, Loader2 } from 'lucide-react'

export default function VoiceAgentsPage() {
  const [agents, setAgents] = useState([
    { id: 'roshanal_inbound', name: 'Roshanal Customer Service', type: 'inbound', division: 'both', is_active: true, total_calls: 0, avg_duration: 0 },
    { id: 'roshanal_qualifier', name: 'Lead Qualifier', type: 'outbound', division: 'both', is_active: true, total_calls: 0, avg_duration: 0 },
    { id: 'roshanal_marine', name: 'Marine Products Specialist', type: 'outbound', division: 'marine', is_active: true, total_calls: 0, avg_duration: 0 },
    { id: 'roshanal_reengagement', name: 'Re-engagement Caller', type: 'outbound', division: 'both', is_active: true, total_calls: 0, avg_duration: 0 },
  ])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-clash text-3xl font-bold text-gray-900">Voice Agents</h1>
          <p className="text-gray-600 mt-1">Powered by ElevenLabs + Twilio</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
          <Plus className="w-4 h-4" /> Create Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${agent.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{agent.type} · {agent.division}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${agent.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                {agent.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <p className="text-gray-500">Calls</p>
                <p className="font-mono font-bold">{agent.total_calls}</p>
              </div>
              <div>
                <p className="text-gray-500">Avg Duration</p>
                <p className="font-mono font-bold">{agent.avg_duration}s</p>
              </div>
              <div>
                <p className="text-gray-500">Success</p>
                <p className="font-mono font-bold">{agent.avg_duration > 0 ? '—' : '0%'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                <Phone className="w-4 h-4" /> Test Call
              </button>
              <button className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Outbound Call Campaign</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Agent</label>
            <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
              <option>Lead Qualifier</option>
              <option>Marine Specialist</option>
              <option>Re-engagement Caller</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Lead List</label>
            <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
              <option>A + B Grade (Qualified)</option>
              <option>All Qualified Leads</option>
              <option>Hot Tier Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Call Window</label>
            <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
              <option>Mon-Fri 9AM-5PM</option>
              <option>Mon-Sat 8AM-6PM</option>
              <option>Custom</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> Start Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
