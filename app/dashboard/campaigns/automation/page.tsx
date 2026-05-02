'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Power, PowerOff, Trash2, Edit2, Zap, Mail, Phone, MessageSquare, Bell } from 'lucide-react'

interface AutomationTrigger {
  id: string
  name: string
  trigger_expression: string
  actions: Array<{ type: string; config: Record<string, unknown> }>
  is_active: boolean
  fired_count: number
  last_fired?: string
  created_at: string
}

const TRIGGER_TYPES = [
  { id: 'lead_created', label: 'New lead created', icon: Zap },
  { id: 'lead_qualified', label: 'Lead qualified (Grade A/B)', icon: Zap },
  { id: 'lead_staged', label: 'Lead moved to stage', icon: Zap },
  { id: 'email_opened', label: 'Email opened', icon: Mail },
  { id: 'email_clicked', label: 'Email link clicked', icon: Mail },
  { id: 'email_replied', label: 'Email replied', icon: Mail },
  { id: 'call_completed', label: 'Call completed', icon: Phone },
  { id: 'whatsapp_read', label: 'WhatsApp message read', icon: MessageSquare },
  { id: 'campaign_completed', label: 'Campaign completed', icon: Zap },
  { id: 'no_response_7d', label: 'No response in 7 days', icon: Bell },
]

const ACTION_TYPES = [
  { id: 'send_email', label: 'Send email', icon: Mail },
  { id: 'send_whatsapp', label: 'Send WhatsApp', icon: MessageSquare },
  { id: 'send_sms', label: 'Send SMS', icon: Phone },
  { id: 'assign_agent', label: 'Assign to agent', icon: Bell },
  { id: 'add_tag', label: 'Add tag', icon: Bell },
  { id: 'change_stage', label: 'Change CRM stage', icon: Bell },
  { id: 'notify_team', label: 'Notify team', icon: Bell },
]

const DEFAULT_TEMPLATES: AutomationTrigger[] = [
  {
    id: 'auto_1',
    name: 'Auto-welcome new leads',
    trigger_expression: 'lead_created',
    actions: [{ type: 'send_email', config: { template: 'introduction', delay_hours: 1 } }],
    is_active: true,
    fired_count: 234,
    last_fired: new Date().toISOString(),
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'auto_2',
    name: 'Follow-up after email open',
    trigger_expression: 'email_opened',
    actions: [
      { type: 'send_whatsapp', config: { message: 'Hi {{first_name}}, saw you checked our email. Any questions?', delay_hours: 2 } },
    ],
    is_active: true,
    fired_count: 89,
    last_fired: new Date().toISOString(),
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'auto_3',
    name: 'Escalate hot leads',
    trigger_expression: 'lead_qualified',
    actions: [
      { type: 'notify_team', config: { message: 'Hot lead qualified: {{full_name}} — {{company}}' } },
      { type: 'send_sms', config: { message: 'Hi {{first_name}}, we\'d love to discuss your needs. Call us: 08109522432', delay_hours: 0 } },
    ],
    is_active: true,
    fired_count: 56,
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'auto_4',
    name: '7-day no response follow-up',
    trigger_expression: 'no_response_7d',
    actions: [
      { type: 'send_email', config: { template: 'follow_up', delay_days: 7 } },
      { type: 'change_stage', config: { stage: 'contacted' } },
    ],
    is_active: false,
    fired_count: 12,
    created_at: '2024-02-10T10:00:00Z',
  },
]

export default function AutomationRulesPage() {
  const [rules, setRules] = useState<AutomationTrigger[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/campaigns/automation', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setRules(data.rules || [])
      }
    } catch {
      setRules(DEFAULT_TEMPLATES)
    } finally {
      setLoading(false)
    }
  }

  const toggleRule = async (id: string) => {
    const rule = rules.find(r => r.id === id)
    if (!rule) return

    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/campaigns/automation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !rule.is_active }),
      })
      setRules(rules.map(r => r.id === id ? { ...r, is_active: !r.is_active } : r))
    } catch {
      console.error('Failed to toggle rule')
    }
  }

  const deleteRule = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/campaigns/automation/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setRules(rules.filter(r => r.id !== id))
    } catch {
      console.error('Failed to delete rule')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-clash text-3xl font-bold text-text-primary">Automation Rules</h1>
          <p className="text-text-secondary mt-1">Set up trigger-based automation for your campaigns and CRM</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-text-primary mb-4">Quick Setup Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRIGGER_TYPES.slice(0, 6).map(trigger => (
            <button
              key={trigger.id}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-3 p-4 border border-border-subtle rounded-lg hover:border-border-hover transition-all text-left"
            >
              <trigger.icon className="w-5 h-5 text-accent-primary" />
              <span className="text-sm text-text-primary">{trigger.label}</span>
            </button>
          ))}
        </div>
      </div>

      <h2 className="font-semibold text-text-primary mb-4">Active Rules ({rules.filter(r => r.is_active).length})</h2>

      <div className="space-y-4">
        {rules.map(rule => {
          const triggerType = TRIGGER_TYPES.find(t => t.id === rule.trigger_expression)
          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-bg-surface border rounded-xl p-6 transition-all ${
                rule.is_active ? 'border-border-subtle' : 'border-border-ghost opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-text-primary">{rule.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      rule.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {rule.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary/10 rounded-lg">
                      {triggerType && <triggerType.icon className="w-4 h-4 text-accent-primary" />}
                      <span className="text-sm text-accent-primary-glow">When: {triggerType?.label || rule.trigger_expression}</span>
                    </div>
                    <span className="text-text-muted">→</span>
                    <div className="flex flex-wrap gap-2">
                      {rule.actions.map((action, i) => {
                        const actionType = ACTION_TYPES.find(a => a.id === action.type)
                        return (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                            {actionType && <actionType.icon className="w-4 h-4 text-emerald-400" />}
                            <span className="text-sm text-emerald-400">Then: {actionType?.label || action.type}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span>Fired: {rule.fired_count} times</span>
                    {rule.last_fired && (
                      <span>Last: {new Date(rule.last_fired).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      rule.is_active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-text-muted hover:bg-bg-elevated'
                    }`}
                  >
                    {rule.is_active ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                  </button>
                  <button className="p-2 text-text-muted hover:bg-bg-elevated rounded-lg">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteRule(rule.id)} className="p-2 text-accent-red hover:bg-accent-red/10 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}

        {rules.length === 0 && !loading && (
          <div className="text-center py-12 border-2 border-dashed border-border-subtle rounded-xl">
            <Zap className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No automation rules yet</h3>
            <p className="text-text-secondary mb-4">Create your first automation to save time and respond faster to leads.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90"
            >
              Create First Rule
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
