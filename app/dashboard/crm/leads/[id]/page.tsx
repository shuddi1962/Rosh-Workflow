'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, Mail, MessageSquare, Building2, MapPin, Calendar, Star, TrendingUp, Edit2, Save, X, Plus, Trash2, Clock, CheckCircle2, AlertCircle, FileText, Send, ArrowLeftRight, MousePointerClick } from 'lucide-react'
import { ROSHANAL_CRM_STAGES, TIER_EMOJIS, GRADE_COLORS } from '@/lib/crm/stages'

const STAGE_COLORS: Record<string, string> = {
  new_lead: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  qualified: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  contacted: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  interested: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  quote_sent: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  negotiation: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  customer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  lost: 'bg-accent-red/20 text-accent-red border-accent-red/30',
}

const ACTIVITY_ICONS: Record<string, typeof Phone> = {
  email_sent: Send,
  email_opened: Mail,
  email_clicked: MousePointerClick,
  whatsapp_sent: MessageSquare,
  call_outbound: Phone,
  call_inbound: Phone,
  stage_changed: ArrowLeftRight,
  score_updated: TrendingUp,
  note_added: FileText,
  quote_sent: FileText,
  purchase: CheckCircle2,
}

interface Lead {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email?: string
  phone: string
  whatsapp?: string
  company?: string
  job_title?: string
  industry?: string
  country: string
  state: string
  city: string
  division_interest: string
  product_interests: string[]
  stage: string
  score: number
  tier: string
  qualification_grade: string
  qualification_status: string
  qualification_reasons: string[]
  disqualifiers: string[]
  talking_points: string[]
  recommended_approach: string
  best_channel: string
  source: string
  emails_sent: number
  emails_opened: number
  whatsapp_sent: number
  calls_made: number
  estimated_deal_value_ngn?: number
  created_at: string
  updated_at: string
}

interface Activity {
  id: string
  type: string
  description: string
  created_at: string
}

export default function LeadProfilePage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string
  const [lead, setLead] = useState<Lead | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [editForm, setEditForm] = useState<Partial<Lead>>({})

  useEffect(() => {
    fetchLead()
  }, [leadId])

  const fetchLead = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const [leadRes, activityRes] = await Promise.all([
        fetch(`/api/crm/leads/${leadId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/crm/leads/${leadId}/activities`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (leadRes.ok) {
        const data = await leadRes.json()
        setLead(data.lead)
        setEditForm(data.lead)
      }
      if (activityRes.ok) {
        const data = await activityRes.json()
        setActivities(data.activities || [])
      }
    } catch {
      console.error('Failed to fetch lead')
    } finally {
      setLoading(false)
    }
  }

  const handleStageChange = async (newStage: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/crm/leads/${leadId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stage: newStage }),
      })
      if (res.ok) fetchLead()
    } catch {
      console.error('Failed to update stage')
    }
  }

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        setEditing(false)
        fetchLead()
      }
    } catch {
      console.error('Failed to save')
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/crm/leads/${leadId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: 'note_added', description: newNote }),
      })
      setNewNote('')
      fetchLead()
    } catch {
      console.error('Failed to add note')
    }
  }

  const handleQuickAction = async (action: string) => {
    const token = localStorage.getItem('accessToken')
    if (action === 'whatsapp' && lead?.phone) {
      window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hello ${lead.first_name}, this is Roshanal Infotech...`)
    } else if (action === 'call' && lead?.phone) {
      window.open(`tel:${lead.phone}`)
    } else if (action === 'email' && lead?.email) {
      window.open(`mailto:${lead.email}?subject=Roshanal Infotech - Marine & Technology Solutions`)
    }
  }

  if (loading) return <div className="p-6 text-text-muted">Loading lead profile...</div>
  if (!lead) return <div className="p-6 text-accent-red">Lead not found</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/dashboard/crm')} className="p-2 hover:bg-bg-elevated rounded-lg">
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div className="flex-1">
          <h1 className="font-clash text-3xl font-bold text-text-primary">{lead.full_name}</h1>
          <p className="text-text-secondary">{lead.job_title || 'No title'} {lead.company ? `at ${lead.company}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(!editing)} className="px-3 py-2 border border-border-subtle rounded-lg text-sm hover:bg-bg-elevated text-text-primary flex items-center gap-2">
            {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {editing ? 'Cancel' : 'Edit'}
          </button>
          {editing && (
            <button onClick={handleSaveEdit} className="px-3 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90 flex items-center gap-2">
              <Save className="w-4 h-4" /> Save
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">Lead Information</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STAGE_COLORS[lead.stage]}`}>
                {ROSHANAL_CRM_STAGES.find(s => s.id === lead.stage)?.label || lead.stage}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">Phone</p>
                <p className="text-sm font-mono text-text-primary flex items-center gap-2">
                  {lead.phone}
                  <button onClick={() => handleQuickAction('call')} className="text-accent-primary-glow hover:text-accent-primary">
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleQuickAction('whatsapp')} className="text-accent-emerald hover:text-accent-emerald/80">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Email</p>
                <p className="text-sm text-text-primary flex items-center gap-2">
                  {lead.email || '—'}
                  {lead.email && (
                    <button onClick={() => handleQuickAction('email')} className="text-accent-primary-glow hover:text-accent-primary">
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Location</p>
                <p className="text-sm text-text-primary flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-text-muted" />
                  {lead.city}, {lead.state}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Source</p>
                <p className="text-sm text-text-primary capitalize">{lead.source.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Division</p>
                <p className="text-sm text-text-primary capitalize">{lead.division_interest}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Company</p>
                <p className="text-sm text-text-primary">{lead.company || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h2 className="font-semibold text-text-primary mb-4">Qualification Details</h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-text-muted mb-1">Grade</p>
                <p className={`text-2xl font-bold ${GRADE_COLORS[lead.qualification_grade]}`}>{lead.qualification_grade}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted mb-1">Score</p>
                <p className="text-2xl font-bold text-text-primary">{lead.score}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted mb-1">Tier</p>
                <p className="text-2xl">{TIER_EMOJIS[lead.tier] || '—'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted mb-1">Deal Value</p>
                <p className="text-2xl font-bold text-accent-emerald font-mono">{(lead.estimated_deal_value_ngn || 0).toLocaleString()}</p>
              </div>
            </div>

            {lead.talking_points?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-text-muted mb-2">Talking Points</p>
                <div className="space-y-1">
                  {lead.talking_points.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-accent-emerald mt-0.5 flex-shrink-0" />
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lead.recommended_approach && (
              <div className="bg-accent-primary/10 rounded-lg p-3">
                <p className="text-xs text-accent-primary-glow font-medium mb-1">Recommended Approach</p>
                <p className="text-sm text-text-primary">{lead.recommended_approach}</p>
              </div>
            )}
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h2 className="font-semibold text-text-primary mb-4">Activity Timeline</h2>
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type] || FileText
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">{activity.description}</p>
                      <p className="text-xs text-text-muted">{new Date(activity.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-border-ghost">
              <p className="text-sm font-medium text-text-primary mb-2">Add Note</p>
              <div className="flex gap-2">
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this lead..."
                  className="flex-1 px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <button onClick={handleAddNote} className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-3">Move Stage</h3>
            <div className="space-y-2">
              {ROSHANAL_CRM_STAGES.map(stage => (
                <button
                  key={stage.id}
                  onClick={() => handleStageChange(stage.id)}
                  disabled={lead.stage === stage.id}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    lead.stage === stage.id
                      ? 'bg-bg-elevated text-text-muted cursor-not-allowed'
                      : 'hover:bg-bg-elevated text-text-primary'
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: stage.color }} />
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => handleQuickAction('whatsapp')} className="w-full px-3 py-2 bg-accent-emerald/20 text-accent-emerald rounded-lg text-sm hover:bg-accent-emerald/30 flex items-center gap-2 justify-center">
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </button>
              <button onClick={() => handleQuickAction('call')} className="w-full px-3 py-2 bg-accent-primary/20 text-accent-primary-glow rounded-lg text-sm hover:bg-accent-primary/30 flex items-center gap-2 justify-center">
                <Phone className="w-4 h-4" /> Call Now
              </button>
              <button onClick={() => handleQuickAction('email')} className="w-full px-3 py-2 border border-border-subtle text-text-primary rounded-lg text-sm hover:bg-bg-elevated flex items-center gap-2 justify-center">
                <Mail className="w-4 h-4" /> Send Email
              </button>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-3">Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Emails Sent</span>
                <span className="font-medium text-text-primary">{lead.emails_sent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">WhatsApp Sent</span>
                <span className="font-medium text-text-primary">{lead.whatsapp_sent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Calls Made</span>
                <span className="font-medium text-text-primary">{lead.calls_made}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Created</span>
                <span className="font-medium text-text-primary">{new Date(lead.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
