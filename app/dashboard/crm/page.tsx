'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Filter, UserPlus, Download, Loader2, RefreshCw } from 'lucide-react'
import { PipelineKanban } from '@/components/crm/pipeline-kanban'
import { ROSHANAL_CRM_STAGES, TIER_EMOJIS } from '@/lib/crm/stages'

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

export default function CRMPipelinePage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [filterGrade, setFilterGrade] = useState<string>('all')
  const [filterDivision, setFilterDivision] = useState<string>('all')
  const [qualifying, setQualifying] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/crm/leads', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads || [])
      }
    } catch {
      console.error('Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  const handleQualifyAll = async () => {
    setQualifying(true)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/crm/leads/qualify-batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchLeads()
      }
    } catch {
      console.error('Failed to qualify leads')
    } finally {
      setQualifying(false)
    }
  }

  const handleStageChange = async (leadId: string, stage: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/crm/leads/${leadId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stage }),
      })
      if (res.ok) fetchLeads()
    } catch {
      console.error('Failed to update stage')
    }
  }

  const handleLeadClick = (lead: Lead) => {
    router.push(`/dashboard/crm/leads/${lead.id}`)
  }

  const filteredLeads = leads.filter(lead => {
    if (filterTier !== 'all' && lead.tier !== filterTier) return false
    if (filterGrade !== 'all' && lead.qualification_grade !== filterGrade) return false
    if (filterDivision !== 'all' && lead.division_interest !== filterDivision) return false
    return true
  })

  const pendingCount = leads.filter(l => l.qualification_status === 'pending').length
  const pipelineValue = leads
    .filter(l => l.stage !== 'lost')
    .reduce((sum, l) => sum + (l.estimated_deal_value_ngn || 0), 0)

  const stageCounts = ROSHANAL_CRM_STAGES.map(s => ({
    ...s,
    count: leads.filter(l => l.stage === s.id).length,
  }))

  if (loading) return <div className="p-6 text-gray-600">Loading CRM pipeline...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-clash text-3xl font-bold text-gray-900">CRM Pipeline</h1>
          <p className="text-gray-600 mt-1">
            Pipeline Value: ₦{pipelineValue.toLocaleString()} estimated across {leads.filter(l => l.stage !== 'lost').length} active leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <button
              onClick={handleQualifyAll}
              disabled={qualifying}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {qualifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Qualify {pendingCount} Pending
            </button>
          )}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add Lead
          </button>
          <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {stageCounts.map(s => (
            <div key={s.id} className="text-center">
              <div className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              </div>
              <p className="text-xs text-gray-600 font-medium">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{s.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
          <span className="text-sm text-gray-500">View:</span>
          <button
            onClick={() => setView('kanban')}
            className={`text-sm px-3 py-1 rounded ${view === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Kanban
          </button>
          <button
            onClick={() => setView('table')}
            className={`text-sm px-3 py-1 rounded ${view === 'table' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Table
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="text-sm bg-transparent text-gray-700 outline-none">
            <option value="all">All Tiers</option>
            <option value="hot">🔥 Hot</option>
            <option value="warm">🌤️ Warm</option>
            <option value="cold">❄️ Cold</option>
          </select>
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="text-sm bg-transparent text-gray-700 outline-none">
            <option value="all">All Grades</option>
            <option value="A">A Grade</option>
            <option value="B">B Grade</option>
            <option value="C">C Grade</option>
            <option value="D">D Grade</option>
          </select>
          <select value={filterDivision} onChange={e => setFilterDivision(e.target.value)} className="text-sm bg-transparent text-gray-700 outline-none">
            <option value="all">All Divisions</option>
            <option value="marine">Marine</option>
            <option value="tech">Technology</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      {view === 'kanban' ? (
        <PipelineKanban
          leads={filteredLeads}
          onLeadClick={handleLeadClick}
          onStageChange={handleStageChange}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-gray-600 text-sm">Name</th>
                <th className="text-left p-3 text-gray-600 text-sm">Company</th>
                <th className="text-left p-3 text-gray-600 text-sm">Phone</th>
                <th className="text-left p-3 text-gray-600 text-sm">Stage</th>
                <th className="text-left p-3 text-gray-600 text-sm">Grade</th>
                <th className="text-left p-3 text-gray-600 text-sm">Score</th>
                <th className="text-left p-3 text-gray-600 text-sm">Division</th>
                <th className="text-left p-3 text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer" onClick={() => handleLeadClick(lead)}>
                  <td className="p-3 text-gray-900 text-sm font-medium">{lead.full_name}</td>
                  <td className="p-3 text-gray-600 text-sm">{lead.company || '—'}</td>
                  <td className="p-3 text-gray-600 text-sm font-mono">{lead.phone}</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded-full" style={{
                      backgroundColor: ROSHANAL_CRM_STAGES.find(s => s.id === lead.stage)?.color + '20',
                      color: ROSHANAL_CRM_STAGES.find(s => s.id === lead.stage)?.color,
                    }}>
                      {ROSHANAL_CRM_STAGES.find(s => s.id === lead.stage)?.label}
                    </span>
                  </td>
                  <td className="p-3 text-sm font-bold" style={{ color: lead.qualification_grade === 'A' ? '#dc2626' : lead.qualification_grade === 'B' ? '#d97706' : lead.qualification_grade === 'C' ? '#2563eb' : '#6b7280' }}>
                    {lead.qualification_grade}
                  </td>
                  <td className="p-3 text-sm font-mono">{lead.score}</td>
                  <td className="p-3 text-sm capitalize">{lead.division_interest}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-green-50 rounded text-green-600" title="WhatsApp">💬</button>
                      <button className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="Email">📧</button>
                      <button className="p-1.5 hover:bg-purple-50 rounded text-purple-600" title="Call">📞</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredLeads.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads yet</h3>
          <p className="text-gray-500 text-sm">Start by adding leads manually, importing a CSV, or running a scraper.</p>
        </div>
      )}
    </div>
  )
}
