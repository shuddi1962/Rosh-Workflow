'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, RefreshCw, CheckCircle2, XCircle, Zap, Download } from 'lucide-react'
import { TIER_EMOJIS, GRADE_COLORS } from '@/lib/crm/stages'

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
  qualification_status: string
  qualification_reasons: string[]
  disqualifiers: string[]
  source: string
  created_at: string
}

export default function QualificationQueuePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [qualifying, setQualifying] = useState(false)
  const [progress, setProgress] = useState<string>('')

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
    setProgress('Starting AI qualification...')
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/crm/leads/qualify-batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProgress(`Done! ${data.qualified} qualified, ${data.disqualified} disqualified, ${data.failed} failed`)
        fetchLeads()
      }
    } catch {
      setProgress('Qualification failed. Try again.')
    } finally {
      setQualifying(false)
    }
  }

  const handleQualifySingle = async (leadId: string) => {
    setProgress('Qualifying lead...')
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/crm/leads/${leadId}/qualify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) fetchLeads()
    } catch {
      console.error('Failed to qualify lead')
    }
  }

  const pendingLeads = leads.filter(l => l.qualification_status === 'pending')
  const qualifiedLeads = leads.filter(l => l.qualification_status === 'qualified' || l.qualification_status === 'manual_override')
  const disqualifiedLeads = leads.filter(l => l.qualification_status === 'disqualified')

  const gradeCounts = {
    A: qualifiedLeads.filter(l => l.qualification_grade === 'A').length,
    B: qualifiedLeads.filter(l => l.qualification_grade === 'B').length,
    C: qualifiedLeads.filter(l => l.qualification_grade === 'C').length,
    D: disqualifiedLeads.filter(l => l.qualification_grade === 'D').length,
  }

  if (loading) return <div className="p-6 text-gray-600">Loading qualification queue...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-clash text-3xl font-bold text-gray-900">AI Qualification Queue</h1>
          <p className="text-gray-600 mt-1">
            ⏳ {pendingLeads.length} leads pending qualification
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingLeads.length > 0 && (
            <button
              onClick={handleQualifyAll}
              disabled={qualifying}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {qualifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Qualify All Pending — Est. {pendingLeads.length}s
            </button>
          )}
        </div>
      </div>

      {progress && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-6 text-sm text-purple-700">
          {progress}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔴</span>
            <h3 className="font-semibold text-gray-900">A Grade</h3>
          </div>
          <p className="text-3xl font-bold text-red-600 font-mono">{gradeCounts.A}</p>
          <p className="text-sm text-gray-500">Hot leads — immediate outreach</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🟡</span>
            <h3 className="font-semibold text-gray-900">B Grade</h3>
          </div>
          <p className="text-3xl font-bold text-amber-600 font-mono">{gradeCounts.B}</p>
          <p className="text-sm text-gray-500">Qualified — warm outreach</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔵</span>
            <h3 className="font-semibold text-gray-900">C Grade</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 font-mono">{gradeCounts.C}</p>
          <p className="text-sm text-gray-500">Lower priority — nurture</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-6 h-6 text-red-500" />
            <h3 className="font-semibold text-gray-900">D Grade</h3>
          </div>
          <p className="text-3xl font-bold text-gray-500 font-mono">{gradeCounts.D}</p>
          <p className="text-sm text-gray-500">Disqualified — do not contact</p>
        </div>
      </div>

      {pendingLeads.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            Pending Qualification ({pendingLeads.length})
          </h2>
          <div className="space-y-2">
            {pendingLeads.map(lead => (
              <div key={lead.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{lead.full_name}</h4>
                  <p className="text-sm text-gray-500">{lead.company || 'No company'} · {lead.source}</p>
                </div>
                <button
                  onClick={() => handleQualifySingle(lead.id)}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                >
                  Qualify
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {qualifiedLeads.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Qualified Leads ({qualifiedLeads.length})
          </h2>
          <div className="space-y-2">
            {qualifiedLeads.slice(0, 20).map(lead => (
              <div key={lead.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${GRADE_COLORS[lead.qualification_grade]}`}>{lead.qualification_grade}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{lead.full_name}</h4>
                    <p className="text-sm text-gray-500">{lead.company || 'No company'} · {lead.tier} · Score: {lead.score}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lead.qualification_reasons?.slice(0, 1).map((r, i) => (
                    <span key={i} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">{r}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {disqualifiedLeads.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Disqualified ({disqualifiedLeads.length})
          </h2>
          <div className="space-y-2">
            {disqualifiedLeads.slice(0, 10).map(lead => (
              <div key={lead.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between opacity-75">
                <div>
                  <h4 className="font-medium text-gray-900">{lead.full_name}</h4>
                  <p className="text-sm text-gray-500">{lead.company || 'No company'} · Score: {lead.score}</p>
                </div>
                <div className="flex items-center gap-2">
                  {lead.disqualifiers?.slice(0, 1).map((d, i) => (
                    <span key={i} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{d}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
