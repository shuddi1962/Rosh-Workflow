'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, Mail, MessageSquare, Building2, MapPin, Calendar, Star, TrendingUp, Edit2, Save, X, Plus, Trash2, Clock, CheckCircle2, AlertCircle, FileText, Send, ArrowLeftRight, MousePointerClick } from 'lucide-react'
import { ROSHANAL_CRM_STAGES, TIER_EMOJIS, GRADE_COLORS } from '@/lib/crm/stages'

const STAGE_COLORS: Record<string, string> = {
  new_lead: 'bg-blue-100 text-blue-700 border-blue-300',
  qualified: 'bg-purple-100 text-purple-700 border-purple-300',
  contacted: 'bg-amber-100 text-amber-700 border-amber-300',
  interested: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  quote_sent: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  negotiation: 'bg-orange-100 text-orange-700 border-orange-300',
  customer: 'bg-green-100 text-green-700 border-green-300',
  lost: 'bg-red-100 text-red-700 border-red-300',
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
  budget_signal: string
  urgency: string
  decision_maker: boolean
  talking_points: string[]
  recommended_approach: string
  estimated_deal_value_ngn?: number
  source: string
  notes: string
  emails_sent: number
  whatsapp_sent: number
  calls_made: number
  last_contacted?: string
  next_action: string
  next_action_date?: string
  created_at: string
  updated_at: string
}

interface Activity {
  id: string
  type: string
  description: string
  metadata: Record<string, unknown>
  performed_by: string
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
  const [editData, setEditData] = useState<Partial<Lead>>({})

  useEffect(() => { fetchLead() }, [leadId])

  const fetchLead = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setLead(data.lead)
        setActivities(data.activities || [])
        setEditData(data.lead)
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
        body: JSON.stringify(editData),
      })
      if (res.ok) {
        setEditing(false)
        fetchLead()
      }
    } catch {
      console.error('Failed to update lead')
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

  if (loading) return <div className="p-6 text-gray-600">Loading lead profile...</div>
  if (!lead) return <div className="p-6 text-red-600">Lead not found</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/dashboard/crm')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="font-clash text-3xl font-bold text-gray-900">{lead.full_name}</h1>
          <p className="text-gray-600">{lead.job_title || 'No title'} {lead.company ? `at ${lead.company}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(!editing)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
            {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {editing ? 'Cancel' : 'Edit'}
          </button>
          {editing && (
            <button onClick={handleSaveEdit} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2">
              <Save className="w-4 h-4" /> Save
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Lead Information</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STAGE_COLORS[lead.stage]}`}>
                {ROSHANAL_CRM_STAGES.find(s => s.id === lead.stage)?.label || lead.stage}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm font-mono flex items-center gap-2">
                  {lead.phone}
                  <button onClick={() => handleQuickAction('call')} className="text-blue-600 hover:text-blue-700">
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleQuickAction('whatsapp')} className="text-green-600 hover:text-green-700">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm flex items-center gap-2">
                  {lead.email || '—'}
                  {lead.email && (
                    <button onClick={() => handleQuickAction('email')} className="text-blue-600 hover:text-blue-700">
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <p className="text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {lead.city}, {lead.state}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Source</p>
                <p className="text-sm capitalize">{lead.source.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Division</p>
                <p className="text-sm capitalize">{lead.division_interest}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Company</p>
                <p className="text-sm">{lead.company || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Qualification Details</h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Grade</p>
                <p className={`text-2xl font-bold ${GRADE_COLORS[lead.qualification_grade]}`}>{lead.qualification_grade}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Score</p>
                <p className="text-2xl font-bold text-gray-900">{lead.score}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Tier</p>
                <p className="text-2xl">{TIER_EMOJIS[lead.tier] || '—'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Deal Value</p>
                <p className="text-2xl font-bold text-green-600 font-mono">₦{(lead.estimated_deal_value_ngn || 0).toLocaleString()}</p>
              </div>
            </div>

            {lead.talking_points?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Talking Points</p>
                <div className="space-y-1">
                  {lead.talking_points.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lead.recommended_approach && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium mb-1">Recommended Approach</p>
                <p className="text-sm text-blue-900">{lead.recommended_approach}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Activity Timeline</h2>
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type] || FileText
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Add Note</p>
              <div className="flex gap-2">
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this lead..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <button onClick={handleAddNote} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Move Stage</h3>
            <div className="space-y-2">
              {ROSHANAL_CRM_STAGES.map(stage => (
                <button
                  key={stage.id}
                  onClick={() => handleStageChange(stage.id)}
                  disabled={lead.stage === stage.id}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    lead.stage === stage.id
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: stage.color }} />
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => handleQuickAction('whatsapp')} className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2 justify-center">
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </button>
              <button onClick={() => handleQuickAction('call')} className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2 justify-center">
                <Phone className="w-4 h-4" /> Call Now
              </button>
              <button onClick={() => handleQuickAction('email')} className="w-full px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 justify-center">
                <Mail className="w-4 h-4" /> Send Email
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Emails Sent</span>
                <span className="font-medium">{lead.emails_sent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">WhatsApp Sent</span>
                <span className="font-medium">{lead.whatsapp_sent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Calls Made</span>
                <span className="font-medium">{lead.calls_made}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">{new Date(lead.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
