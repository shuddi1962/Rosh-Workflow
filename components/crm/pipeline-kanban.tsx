'use client'

import { useState, useEffect } from 'react'
import { UserPlus, CheckCircle, PhoneCall, ThumbsUp, FileText, ArrowLeftRight, Star, XCircle, MessageSquare, Mail, Phone } from 'lucide-react'
import { ROSHANAL_CRM_STAGES, TIER_EMOJIS, TIER_COLORS, GRADE_COLORS } from '@/lib/crm/stages'

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

const STAGE_ICONS: Record<string, typeof UserPlus> = {
  new_lead: UserPlus,
  qualified: CheckCircle,
  contacted: PhoneCall,
  interested: ThumbsUp,
  quote_sent: FileText,
  negotiation: ArrowLeftRight,
  customer: Star,
  lost: XCircle,
}

interface PipelineKanbanProps {
  leads: Lead[]
  onLeadClick?: (lead: Lead) => void
  onStageChange?: (leadId: string, stage: string) => void
}

export function PipelineKanban({ leads, onLeadClick, onStageChange }: PipelineKanbanProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const leadsByStage = ROSHANAL_CRM_STAGES.map(stage => ({
    ...stage,
    leads: leads.filter(l => l.stage === stage.id),
  }))

  const handleDragStart = (leadId: string) => {
    setDraggingId(leadId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (stageId: string) => {
    if (draggingId && onStageChange) {
      onStageChange(draggingId, stageId)
    }
    setDraggingId(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {leadsByStage.map(stage => {
        const Icon = STAGE_ICONS[stage.id] || UserPlus
        return (
          <div
            key={stage.id}
            className="bg-gray-50 rounded-xl p-3 min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage.id)}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
              <Icon className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900 text-sm">{stage.label}</h3>
              <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">{stage.leads.length}</span>
            </div>

            <div className="space-y-2">
              {stage.leads.map(lead => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => handleDragStart(lead.id)}
                  onClick={() => onLeadClick?.(lead)}
                  className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm truncate flex-1">{lead.full_name}</h4>
                    <span className={`text-xs font-bold ${GRADE_COLORS[lead.qualification_grade] || 'text-gray-500'}`}>
                      {lead.qualification_grade}
                    </span>
                  </div>

                  {lead.company && (
                    <p className="text-gray-500 text-xs truncate mb-2">{lead.company}</p>
                  )}

                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`w-2 h-2 rounded-full ${TIER_COLORS[lead.tier] || 'bg-gray-400'}`} />
                    <span className="text-xs text-gray-600">
                      {TIER_EMOJIS[lead.tier] || ''} {lead.tier}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">Score: {lead.score}</span>
                  </div>

                  {lead.product_interests?.length > 0 && (
                    <p className="text-gray-500 text-xs truncate mb-2">
                      {lead.product_interests.slice(0, 2).join(', ')}
                    </p>
                  )}

                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                    {(lead.best_channel === 'whatsapp' || lead.phone) && (
                      <button className="p-1.5 hover:bg-green-50 rounded text-green-600 transition">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {lead.email && (
                      <button className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition">
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button className="p-1.5 hover:bg-purple-50 rounded text-purple-600 transition">
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
