'use client'

import { useState } from 'react'
import { MessageSquare, Mail, Phone, StickyNote } from 'lucide-react'
import DualEntryModal from './dual-entry-modal'

export const PIPELINE_STAGES = [
  { id: 'new_leads', label: 'New Leads', color: '#2563EB', border: 'border-accent-primary' },
  { id: 'contacted', label: 'Contacted', color: '#D97706', border: 'border-accent-gold' },
  { id: 'qualified', label: 'Qualified', color: '#7C3AED', border: 'border-accent-purple' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: '#EA580C', border: 'border-accent-orange' },
  { id: 'closed_won', label: 'Closed Won', color: '#16A34A', border: 'border-accent-emerald' },
]

interface Lead {
  id: string
  full_name: string
  company?: string
  phone: string
  email?: string
  division_interest: string
  score: number
  tier: string
  qualification_grade: string
  stage: string
  best_channel: string
  qualification_status: string
  product_interests: string[]
  estimated_deal_value_ngn?: number
  created_at?: string
}

interface KanbanPipelineProps {
  leads: Lead[]
  onStageChange: (leadId: string, stage: string) => void
  onLeadClick: (lead: Lead) => void
  onLeadSaved: () => void
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return 'Just now'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function KanbanPipeline({ leads, onStageChange, onLeadClick, onLeadSaved }: KanbanPipelineProps) {
  const [showDualEntry, setShowDualEntry] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const getDivisionBadge = (div: string) => {
    switch (div) {
      case 'marine': return 'bg-accent-primary/10 text-accent-primary'
      case 'tech': return 'bg-accent-purple/10 text-accent-purple'
      case 'both': return 'bg-accent-emerald/10 text-accent-emerald'
      default: return 'bg-bg-surface text-text-secondary'
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'hot': return 'bg-accent-red/10 text-accent-red'
      case 'warm': return 'bg-accent-gold/10 text-accent-gold'
      case 'cold': return 'bg-accent-primary/10 text-accent-primary'
      default: return 'bg-bg-surface text-text-secondary'
    }
  }

  const handleDragStart = (id: string) => setDraggingId(id)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (stageId: string) => {
    if (draggingId) onStageChange(draggingId, stageId)
    setDraggingId(null)
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.id)
          return (
            <div key={stage.id} className="flex flex-col min-h-[400px]">
              <div
                className="rounded-t-xl p-3 bg-white border border-border-subtle border-b-0"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
                style={{ borderTop: `3px solid ${stage.color}` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h3 className="font-semibold text-text-primary text-sm">{stage.label}</h3>
                  </div>
                  <span className="bg-bg-elevated text-text-secondary rounded-full px-2 py-0.5 text-xs font-medium">{stageLeads.length}</span>
                </div>
              </div>

              <div className="flex-1 bg-bg-surface/50 border border-border-subtle rounded-b-xl p-2 space-y-2 min-h-[300px]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                {stageLeads.length === 0 && (
                  <div className="text-center py-8 text-text-muted text-sm space-y-3">
                    <p>No leads</p>
                    <button
                      onClick={() => setShowDualEntry(true)}
                      className="mx-auto inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-border-subtle rounded-lg text-xs text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Add Lead
                    </button>
                  </div>
                )}

                {stageLeads.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    onClick={() => onLeadClick(lead)}
                    className={`bg-white rounded-lg p-3 border border-border-subtle hover:shadow-md cursor-pointer transition-all border-l-4 ${draggingId === lead.id ? 'opacity-50' : ''}`}
                    style={{ borderLeftColor: stage.color }}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <h4 className="font-medium text-text-primary text-sm truncate flex-1">{lead.full_name}</h4>
                      <span className="text-xs font-bold ml-2" style={{ color: lead.qualification_grade === 'A' ? '#dc2626' : lead.qualification_grade === 'B' ? '#d97706' : '#6b7280' }}>
                        {lead.qualification_grade}
                      </span>
                    </div>

                    {lead.company && <p className="text-xs text-text-muted truncate mb-1.5">{lead.company}</p>}

                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getDivisionBadge(lead.division_interest)}`}>
                        {lead.division_interest === 'marine' ? 'Marine' : lead.division_interest === 'tech' ? 'Tech' : 'Both'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getTierBadge(lead.tier)}`}>
                        {lead.tier.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-text-muted ml-auto">Score: {lead.score}</span>
                    </div>

                    {lead.product_interests?.length > 0 && (
                      <p className="text-xs text-text-muted truncate mb-1.5">{lead.product_interests.slice(0, 2).join(', ')}</p>
                    )}

                    <p className="text-xs text-text-muted mb-2">{timeAgo(lead.created_at)}</p>

                    <div className="flex items-center gap-1 pt-2 border-t border-border-ghost">
                      <button
                        onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone?.replace(/^0/, '234')}`, '_blank') }}
                        className="p-1.5 hover:bg-accent-emerald/10 rounded text-accent-emerald transition"
                        title="WhatsApp"
                      ><MessageSquare className="w-3.5 h-3.5" /></button>
                      {lead.email && (
                        <button
                          onClick={e => { e.stopPropagation(); window.open(`mailto:${lead.email}`, '_blank') }}
                          className="p-1.5 hover:bg-accent-primary/10 rounded text-accent-primary transition"
                          title="Email"
                        ><Mail className="w-3.5 h-3.5" /></button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); window.open(`tel:${lead.phone}`, '_self') }}
                        className="p-1.5 hover:bg-accent-purple/10 rounded text-accent-purple transition"
                        title="Call"
                      ><Phone className="w-3.5 h-3.5" /></button>
                      <button
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 hover:bg-bg-surface rounded text-text-muted transition ml-auto"
                        title="Note"
                      ><StickyNote className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowDualEntry(true)}
                className="mt-2 w-full py-2 border-2 border-dashed border-border-subtle rounded-lg text-sm text-text-muted hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 transition-colors"
              >
                + Add Lead
              </button>
            </div>
          )
        })}
      </div>

      <DualEntryModal open={showDualEntry} onClose={() => setShowDualEntry(false)} onLeadSaved={onLeadSaved} />
    </div>
  )
}
