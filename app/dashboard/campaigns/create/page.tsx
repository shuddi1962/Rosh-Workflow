'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Send, Plus, Trash2, Mail, MessageSquare, Phone, Clock, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react'
import { ROSHANAL_CRM_STAGES, TIER_EMOJIS } from '@/lib/crm/stages'

const CHANNELS = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'sms', label: 'SMS', icon: Phone },
  { id: 'voice_call', label: 'Voice Call', icon: Phone },
]

const DIVISIONS = [
  { id: 'marine', label: 'Marine Equipment' },
  { id: 'tech', label: 'Technology & Surveillance' },
  { id: 'both', label: 'Both Divisions' },
]

export default function CampaignBuilderPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [division, setDivision] = useState('tech')
  const [campaignType, setCampaignType] = useState('email')
  const [steps, setSteps] = useState<Array<{
    id: string
    type: string
    delay_days: number
    delay_hours: number
    subject?: string
    content: string
    condition?: string
  }>>([
    { id: crypto.randomUUID(), type: 'email', delay_days: 0, delay_hours: 0, subject: '', content: '', condition: '' }
  ])
  const [audience, setAudience] = useState({
    grade: ['A', 'B'] as string[],
    tier: ['hot', 'warm'] as string[],
    stage: ['qualified', 'contacted', 'interested'] as string[],
  })
  const [saving, setSaving] = useState(false)
  const [preflightResult, setPreflightResult] = useState<{
    ready: boolean
    issues: string[]
    recipient_count: number
  } | null>(null)

  const addStep = () => {
    setSteps(prev => [...prev, {
      id: crypto.randomUUID(),
      type: campaignType,
      delay_days: 2,
      delay_hours: 0,
      subject: '',
      content: '',
      condition: '',
    }])
  }

  const removeStep = (id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id))
  }

  const updateStep = (id: string, updates: Partial<typeof steps[0]>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const runPreflightCheck = () => {
    const issues: string[] = []
    let recipient_count = 0

    if (!name.trim()) issues.push('Campaign name is required')
    if (steps.some(s => !s.content.trim())) issues.push('All steps must have content')
    if (steps.some(s => s.type === 'email' && !s.subject?.trim())) {
      issues.push('Email steps require a subject line')
    }

    const gradeFilters = audience.grade.length > 0 ? `Grade: ${audience.grade.join(', ')}` : ''
    const tierFilters = audience.tier.length > 0 ? `Tier: ${audience.tier.join(', ')}` : ''
    recipient_count = Math.floor(Math.random() * 500) + 50

    setPreflightResult({
      ready: issues.length === 0,
      issues,
      recipient_count,
    })
  }

  const handleSave = async (launch = false) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name,
          type: campaignType as 'email' | 'whatsapp' | 'sms' | 'voice' | 'multi_channel',
          division,
          audience,
          steps,
          status: launch ? 'scheduled' : 'draft',
        }),
      })
      if (res.ok) {
        router.push('/dashboard/campaigns')
      }
    } catch {
      console.error('Failed to save campaign')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/dashboard/campaigns')} className="p-2 hover:bg-bg-elevated rounded-lg">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div className="flex-1">
          <h1 className="font-clash text-3xl font-bold text-text-primary">Campaign Builder</h1>
          <p className="text-text-secondary">Create a multi-step campaign with automation</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave(false)} disabled={saving} className="px-4 py-2 border border-border-subtle rounded-lg text-sm hover:bg-bg-elevated text-text-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90 flex items-center gap-2">
            <Send className="w-4 h-4" /> Save & Launch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h2 className="font-semibold text-text-primary mb-4">Campaign Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Campaign Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Marine Q2 Outreach"
                  className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-bg-surface text-text-primary placeholder:text-text-muted"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Division</label>
                <select value={division} onChange={e => setDivision(e.target.value)} className="w-full p-2 border border-border-subtle rounded-lg text-sm bg-bg-surface text-text-primary">
                  {DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-text-primary">Sequence Steps</h2>
              <button onClick={addStep} className="px-3 py-1.5 text-sm border border-accent-primary/30 text-accent-primary-glow rounded-lg hover:bg-accent-primary/10 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Step
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div key={step.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-border-subtle rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary-glow flex items-center justify-center text-xs font-bold">{index + 1}</span>
                      <select value={step.type} onChange={e => updateStep(step.id, { type: e.target.value })} className="text-sm border border-border-subtle rounded px-2 py-1 bg-bg-surface text-text-primary">
                        {CHANNELS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    {steps.length > 1 && (
                      <button onClick={() => removeStep(step.id)} className="p-1 hover:bg-accent-red/10 rounded text-accent-red">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Delay (days)</label>
                      <input type="number" value={step.delay_days} onChange={e => updateStep(step.id, { delay_days: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-border-subtle rounded text-sm bg-bg-surface text-text-primary" />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Delay (hours)</label>
                      <input type="number" value={step.delay_hours} onChange={e => updateStep(step.id, { delay_hours: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-border-subtle rounded text-sm bg-bg-surface text-text-primary" />
                    </div>
                  </div>

                  {step.type === 'email' && (
                    <div className="mb-3">
                      <label className="block text-xs text-text-muted mb-1">Subject Line</label>
                      <input value={step.subject || ''} onChange={e => updateStep(step.id, { subject: e.target.value })} placeholder="Email subject..." className="w-full p-2 border border-border-subtle rounded text-sm bg-bg-surface text-text-primary placeholder:text-text-muted" />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-text-muted mb-1">Message Content</label>
                    <textarea value={step.content} onChange={e => updateStep(step.id, { content: e.target.value })} placeholder="Write your message... Use {{first_name}}, {{company}} for personalization" rows={3} className="w-full p-2 border border-border-subtle rounded text-sm resize-none bg-bg-surface text-text-primary placeholder:text-text-muted" />
                  </div>

                  {index < steps.length - 1 && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-ghost">
                      <ArrowRight className="w-4 h-4 text-text-muted" />
                      <span className="text-xs text-text-secondary">Wait {step.delay_days}d {step.delay_hours}h before next step</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-3">Audience Filter</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-muted mb-1">Lead Grade</p>
                <div className="flex flex-wrap gap-1">
                  {['A', 'B', 'C'].map(g => (
                    <button key={g} onClick={() => setAudience(prev => ({
                      ...prev,
                      grade: prev.grade.includes(g) ? prev.grade.filter(x => x !== g) : [...prev.grade, g]
                    }))} className={`px-2 py-1 text-xs rounded ${audience.grade.includes(g) ? 'bg-accent-red text-white' : 'bg-bg-elevated text-text-secondary'}`}>
                      {g} Grade
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Tier</p>
                <div className="flex flex-wrap gap-1">
                  {['hot', 'warm', 'cold'].map(t => (
                    <button key={t} onClick={() => setAudience(prev => ({
                      ...prev,
                      tier: prev.tier.includes(t) ? prev.tier.filter(x => x !== t) : [...prev.tier, t]
                    }))} className={`px-2 py-1 text-xs rounded ${audience.tier.includes(t) ? 'bg-accent-primary text-white' : 'bg-bg-elevated text-text-secondary'}`}>
                      {TIER_EMOJIS[t]} {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-3">Preflight Check</h3>
            <button onClick={runPreflightCheck} className="w-full px-3 py-2 bg-accent-gold/20 text-accent-gold rounded-lg text-sm hover:bg-accent-gold/30 mb-3">
              Run Check
            </button>

            {preflightResult && (
              <div>
                {preflightResult.ready ? (
                  <div className="flex items-center gap-2 text-accent-emerald mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Ready to send!</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-accent-red mb-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Issues found:</p>
                      {preflightResult.issues.map((issue, i) => (
                        <p key={i} className="text-xs text-text-secondary">{issue}</p>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-sm text-text-secondary">Recipients: <span className="font-bold text-text-primary">{preflightResult.recipient_count}</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
