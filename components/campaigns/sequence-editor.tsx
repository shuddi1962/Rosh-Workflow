'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Mail, MessageSquare, Phone, Clock, ArrowRight, GripVertical, AlertTriangle } from 'lucide-react'

interface SequenceStep {
  id: string
  type: 'email' | 'whatsapp' | 'sms' | 'voice_call' | 'wait' | 'condition'
  delay_days: number
  delay_hours: number
  send_at_time: string
  subject?: string
  content: string
  condition?: {
    if: 'opened' | 'clicked' | 'replied' | 'not_opened' | 'not_replied'
    then: 'next_step' | 'skip_to' | 'remove_from_sequence' | 'notify_team'
    target_step?: number
  }
  status: 'draft' | 'active' | 'completed' | 'skipped'
}

const CHANNELS = [
  { id: 'email', label: 'Email', icon: Mail, color: 'text-blue-500' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
  { id: 'sms', label: 'SMS', icon: Phone, color: 'text-purple-500' },
  { id: 'voice_call', label: 'Voice Call', icon: Phone, color: 'text-orange-500' },
  { id: 'wait', label: 'Wait', icon: Clock, color: 'text-gray-500' },
]

const CONDITIONS = [
  { value: 'opened', label: 'Email opened' },
  { value: 'clicked', label: 'Link clicked' },
  { value: 'replied', label: 'Replied' },
  { value: 'not_opened', label: 'Not opened' },
  { value: 'not_replied', label: 'Not replied' },
]

const ACTIONS = [
  { value: 'next_step', label: 'Continue to next step' },
  { value: 'skip_to', label: 'Skip to step' },
  { value: 'remove_from_sequence', label: 'Remove from sequence' },
  { value: 'notify_team', label: 'Notify team' },
]

interface SequenceEditorProps {
  steps: SequenceStep[]
  onChange: (steps: SequenceStep[]) => void
  campaignType?: string
}

export function SequenceEditor({ steps, onChange, campaignType }: SequenceEditorProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const addStep = (type: SequenceStep['type']) => {
    const newStep: SequenceStep = {
      id: crypto.randomUUID(),
      type,
      delay_days: type === 'wait' ? 2 : 0,
      delay_hours: 0,
      send_at_time: '09:00',
      subject: type === 'email' ? '' : undefined,
      content: type === 'wait' ? '' : '',
      status: 'draft',
    }
    onChange([...steps, newStep])
  }

  const removeStep = (id: string) => {
    if (steps.length <= 1) return
    onChange(steps.filter(s => s.id !== id))
  }

  const updateStep = (id: string, updates: Partial<SequenceStep>) => {
    onChange(steps.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const moveStep = (fromIndex: number, toIndex: number) => {
    const newSteps = [...steps]
    const [moved] = newSteps.splice(fromIndex, 1)
    newSteps.splice(toIndex, 0, moved)
    onChange(newSteps)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {CHANNELS.map(channel => (
          <button
            key={channel.id}
            onClick={() => addStep(channel.id as SequenceStep['type'])}
            className="px-3 py-2 border border-border-subtle rounded-lg text-sm hover:bg-bg-elevated transition-colors flex items-center gap-2"
          >
            <channel.icon className={`w-4 h-4 ${channel.color}`} />
            Add {channel.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const channel = CHANNELS.find(c => c.id === step.type)
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 ${
                step.status === 'skipped' ? 'border-gray-300 opacity-60' :
                step.status === 'completed' ? 'border-emerald-300' :
                'border-border-subtle'
              }`}
              draggable
              onDragStart={() => setDraggedId(step.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedId && draggedId !== step.id) {
                  const fromIndex = steps.findIndex(s => s.id === draggedId)
                  const toIndex = index
                  moveStep(fromIndex, toIndex)
                }
                setDraggedId(null)
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                  <span className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary-glow flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  {channel && <channel.icon className={`w-4 h-4 ${channel.color}`} />}
                  <span className="text-sm font-medium">{channel?.label || step.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    step.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                    step.status === 'active' ? 'bg-blue-100 text-blue-700' :
                    step.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {step.status}
                  </span>
                </div>
                {steps.length > 1 && (
                  <button onClick={() => removeStep(step.id)} className="p-1 hover:bg-accent-red/10 rounded text-accent-red">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {step.type !== 'wait' && (
                <>
                  {step.type === 'email' && (
                    <div className="mb-3">
                      <label className="block text-xs text-text-muted mb-1">Subject Line</label>
                      <input
                        value={step.subject || ''}
                        onChange={e => updateStep(step.id, { subject: e.target.value })}
                        placeholder="Email subject..."
                        className="w-full p-2 bg-bg-surface border border-border-subtle rounded text-sm text-text-primary"
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="block text-xs text-text-muted mb-1">
                      {step.type === 'email' ? 'Email Body' : 'Message Content'}
                    </label>
                    <textarea
                      value={step.content}
                      onChange={e => updateStep(step.id, { content: e.target.value })}
                      placeholder={step.type === 'email'
                        ? "Write your email... Use {{first_name}}, {{company}} for personalization"
                        : "Write your message..."}
                      rows={3}
                      className="w-full p-2 bg-bg-surface border border-border-subtle rounded text-sm resize-none text-text-primary"
                    />
                  </div>
                </>
              )}

              {step.type === 'wait' && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Wait {step.delay_days} days {step.delay_hours} hours</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Delay (days)</label>
                  <input
                    type="number"
                    value={step.delay_days}
                    onChange={e => updateStep(step.id, { delay_days: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-bg-surface border border-border-subtle rounded text-sm text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Delay (hours)</label>
                  <input
                    type="number"
                    value={step.delay_hours}
                    onChange={e => updateStep(step.id, { delay_hours: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-bg-surface border border-border-subtle rounded text-sm text-text-primary"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs text-text-muted mb-1">Send at time (WAT)</label>
                <input
                  type="time"
                  value={step.send_at_time}
                  onChange={e => updateStep(step.id, { send_at_time: e.target.value })}
                  className="p-2 bg-bg-surface border border-border-subtle rounded text-sm text-text-primary"
                />
              </div>

              {step.type !== 'wait' && (
                <div className="border-t border-border-subtle pt-3 mt-3">
                  <p className="text-xs text-text-muted mb-2 font-medium">Condition (optional)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-text-muted mb-1">If</label>
                      <select
                        value={step.condition?.if || ''}
                        onChange={e => updateStep(step.id, {
                          condition: e.target.value ? {
                            if: e.target.value as 'opened' | 'clicked' | 'replied' | 'not_opened' | 'not_replied',
                            then: step.condition?.then || 'next_step',
                          } : undefined
                        })}
                        className="w-full p-2 bg-bg-surface border border-border-subtle rounded text-sm text-text-primary"
                      >
                        <option value="">No condition</option>
                        {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    {step.condition?.if && (
                      <div>
                        <label className="block text-xs text-text-muted mb-1">Then</label>
                        <select
                          value={step.condition?.then || 'next_step'}
                          onChange={e => updateStep(step.id, {
                            condition: {
                              ...step.condition!,
                              then: e.target.value as 'next_step' | 'skip_to' | 'remove_from_sequence' | 'notify_team',
                            }
                          })}
                          className="w-full p-2 bg-bg-surface border border-border-subtle rounded text-sm text-text-primary"
                        >
                          {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {index < steps.length - 1 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                  <span className="text-xs text-text-muted">
                    Wait {step.delay_days}d {step.delay_hours}h → {CHANNELS.find(c => c.id === steps[index + 1]?.type)?.label || 'Next step'}
                  </span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {steps.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-border-subtle rounded-lg">
          <AlertTriangle className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted">No steps added yet. Add your first step above.</p>
        </div>
      )}
    </div>
  )
}
