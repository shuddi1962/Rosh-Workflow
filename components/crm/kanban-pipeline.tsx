'use client'

import { useState } from 'react'
import { MessageSquare, Mail, Phone, StickyNote } from 'lucide-react'
import DualEntryModal from './dual-entry-modal'

export const PIPELINE_STAGES = [
  { id: 'new_leads', label: 'New Leads', color: '#2563EB', border: 'border-blue-600' },
  { id: 'contacted', label: 'Contacted', color: '#D97706', border: 'border-amber-500' },
  { id: 'qualified', label: 'Qualified', color: '#7C3AED', border: 'border-purple-600' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: '#EA580C', border: 'border-orange-500' },
  { id: 'closed_won', label: 'Closed Won', color: '#16A34A', border: 'border-green-600' },
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
      case 'marine': return 'bg-blue-100 text-blue-700'
      case 'tech': return 'bg-purple-100 text-purple-700'
      case 'both': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'hot': return 'bg-red-100 text-red-700'
      case 'warm': return 'bg-amber-100 text-amber-700'
      case 'cold': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
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
                className="rounded-t-xl p-3 bg-white border border-gray-200 border-b-0"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
                style={{ borderTop: `3px solid ${stage.color}` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h3 className="font-semibold text-gray-900 text-sm">{stage.label}</h3>
                  </div>
                  <span className="bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs font-medium">{stageLeads.length}</span>
                </div>
              </div>

              <div className="flex-1 bg-gray-50/50 border border-gray-200 rounded-b-xl p-2 space-y-2 min-h-[300px]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                {stageLeads.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p>No leads</p>
                  </div>
                )}

                {stageLeads.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    onClick={() => onLeadClick(lead)}
                    className={`bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md cursor-pointer transition-all border-l-4 ${draggingId === lead.id ? 'opacity-50' : ''}`}
                    style={{ borderLeftColor: stage.color }}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <h4 className="font-medium text-gray-900 text-sm truncate flex-1">{lead.full_name}</h4>
                      <span className="text-xs font-bold ml-2" style={{ color: lead.qualification_grade === 'A' ? '#dc2626' : lead.qualification_grade === 'B' ? '#d97706' : '#6b7280' }}>
                        {lead.qualification_grade}
                      </span>
                    </div>

                    {lead.company && <p className="text-xs text-gray-500 truncate mb-1.5">{lead.company}</p>}

                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getDivisionBadge(lead.division_interest)}`}>
                        {lead.division_interest === 'marine' ? 'Marine' : lead.division_interest === 'tech' ? 'Tech' : 'Both'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getTierBadge(lead.tier)}`}>
                        {lead.tier.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-auto">Score: {lead.score}</span>
                    </div>

                    {lead.product_interests?.length > 0 && (
                      <p className="text-xs text-gray-500 truncate mb-1.5">{lead.product_interests.slice(0, 2).join(', ')}</p>
                    )}

                    <p className="text-xs text-gray-400 mb-2">{timeAgo(lead.created_at)}</p>

                    <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                      <button
                        onClick={e => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone?.replace(/^0/, '234')}`, '_blank') }}
                        className="p-1.5 hover:bg-green-50 rounded text-green-600 transition"
                        title="WhatsApp"
                      ><MessageSquare className="w-3.5 h-3.5" /></button>
                      {lead.email && (
                        <button
                          onClick={e => { e.stopPropagation(); window.open(`mailto:${lead.email}`, '_blank') }}
                          className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition"
                          title="Email"
                        ><Mail className="w-3.5 h-3.5" /></button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); window.open(`tel:${lead.phone}`, '_self') }}
                        className="p-1.5 hover:bg-purple-50 rounded text-purple-600 transition"
                        title="Call"
                      ><Phone className="w-3.5 h-3.5" /></button>
                      <button
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition ml-auto"
                        title="Note"
                      ><StickyNote className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowDualEntry(true)}
                className="mt-2 w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30 transition-colors"
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
