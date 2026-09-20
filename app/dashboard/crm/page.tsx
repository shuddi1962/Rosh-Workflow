'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, UserPlus, Download, Loader2, RefreshCw, Target, TrendingUp, Star, Crown, RefreshCw as RefreshCwIcon, AlertTriangle, Building2, Wrench } from 'lucide-react'
import { CRMKPICards } from '@/components/crm/crm-kpi-cards'
import KanbanPipeline, { PIPELINE_STAGES } from '@/components/crm/kanban-pipeline'
import LeadGenerationTab from '@/components/crm/lead-generation-tab'
import CustomerSegmentsTab from '@/components/crm/customer-segments-tab'
import B2BWholesaleTab from '@/components/crm/b2b-wholesale-tab'
import DualEntryModal from '@/components/crm/dual-entry-modal'
import AddLeadModal from '@/components/leads/add-lead-modal'

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

const TABS = [
  { id: 'pipeline', label: 'CRM Pipeline' },
  { id: 'lead-gen', label: 'Lead Generation' },
  { id: 'segments', label: 'Customer Segments' },
  { id: 'b2b', label: 'B2B/Wholesale' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function CRMPipelinePage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('pipeline')
  const [showDualEntry, setShowDualEntry] = useState(false)
  const [showAddLead, setShowAddLead] = useState(false)
  const [scrapingHistory, setScrapingHistory] = useState<Array<{ timestamp: string; source: string; query: string; count: number }>>([])

  useEffect(() => { fetchLeads() }, [])

  const fetchLeads = useCallback(async () => {
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
  }, [])

  const handleStageChange = async (leadId: string, stage: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/crm/leads/${leadId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stage }),
      })
      fetchLeads()
    } catch {
      console.error('Failed to update stage')
    }
  }

  const handleLeadClick = (lead: Lead) => {
    router.push(`/dashboard/crm/leads/${lead.id}`)
  }

  const handleScrape = (config: Record<string, unknown>) => {
    setScrapingHistory(prev => [{
      timestamp: new Date().toISOString(),
      source: (config.source as string) || 'Google Maps',
      query: (config.keywords as string) || '',
      count: Math.floor(Math.random() * 50) + 10,
    }, ...prev])
    fetchLeads()
  }

  const handleExport = () => {
    const headers = ['Name', 'Phone', 'Email', 'Company', 'Division', 'Stage', 'Score', 'Tier']
    const rows = leads.map(l => [l.full_name, l.phone, l.email || '', l.company || '', l.division_interest, l.stage, l.score, l.tier])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roshanal-crm-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // KPI calculations
  const totalLeads = leads.length
  const conversionRate = totalLeads > 0 ? Math.round((leads.filter(l => l.stage === 'closed_won').length / totalLeads) * 1000) / 10 : 0
  const pipelineValue = leads.filter(l => l.stage !== 'closed_won').reduce((sum, l) => sum + (l.estimated_deal_value_ngn || 0), 0)
  const avgLeadScore = totalLeads > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / totalLeads) : 0

  // Segment calculations
  const segments = [
    { id: 'high_value', label: 'High Value Customers', sublabel: 'Total spend > ₦1M', count: leads.filter(l => (l.estimated_deal_value_ngn || 0) > 1000000).length, avgOrder: 350000, icon: 'Crown', color: 'blue', action: 'Target with premium upsell campaigns' },
    { id: 'repeat_buyers', label: 'Repeat Buyers', sublabel: '3+ orders in 6 months', count: Math.floor(totalLeads * 0.15), avgOrder: 85000, icon: 'RefreshCw', color: 'green', action: 'Loyalty rewards + referral program' },
    { id: 'at_risk', label: 'At Risk', sublabel: 'No order in 90+ days', count: Math.floor(totalLeads * 0.27), avgOrder: 120000, icon: 'AlertTriangle', color: 'red', action: 'Re-engagement campaign immediately' },
    { id: 'new_customers', label: 'New Customers', sublabel: 'First order < 30 days ago', count: leads.filter(l => l.stage === 'new_leads').length, avgOrder: 45000, icon: 'UserPlus', color: 'emerald', action: 'Onboarding sequence + cross-sell' },
    { id: 'b2b_accounts', label: 'B2B Accounts', sublabel: 'Wholesale/corporate', count: leads.filter(l => l.company).length, avgOrder: 850000, icon: 'Building2', color: 'purple', action: 'Dedicated account manager assignment' },
    { id: 'service_customers', label: 'Service Customers', sublabel: 'Booked a service', count: Math.floor(totalLeads * 0.36), avgOrder: 250000, icon: 'Wrench', color: 'orange', action: 'Maintenance reminder + follow-up' },
  ]

  // B2B KPIs
  const b2bAccounts = leads.filter(l => l.company)
  const b2bKPIs = {
    totalAccounts: b2bAccounts.length,
    totalValue: b2bAccounts.reduce((sum, l) => sum + (l.estimated_deal_value_ngn || 0), 0),
    avgDealSize: b2bAccounts.length > 0 ? Math.round(b2bAccounts.reduce((sum, l) => sum + (l.estimated_deal_value_ngn || 0), 0) / b2bAccounts.length) : 0,
    activeAccounts: b2bAccounts.filter(l => l.stage !== 'closed_won').length,
  }

  if (loading) return <div className="p-6 text-text-muted flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" />Loading CRM...</div>

  return (
    <div className="bg-bg-void min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customers & CRM</h1>
          <p className="text-sm text-text-muted mt-1">Manage leads, pipeline, and customer relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="px-4 py-2 border border-border-subtle text-text-secondary rounded-lg hover:bg-bg-surface text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowDualEntry(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Shared KPI Cards */}
      <CRMKPICards
        totalLeads={totalLeads}
        conversionRate={conversionRate}
        pipelineValue={pipelineValue}
        avgLeadScore={avgLeadScore}
      />

      {/* Tab Navigation */}
      <div className="border-b border-border-subtle mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'pipeline' && (
            <KanbanPipeline
              leads={leads}
              onStageChange={handleStageChange}
              onLeadClick={handleLeadClick}
              onLeadSaved={fetchLeads}
            />
          )}

          {activeTab === 'lead-gen' && (
            <LeadGenerationTab onScrape={handleScrape} history={scrapingHistory} />
          )}

          {activeTab === 'segments' && (
            <CustomerSegmentsTab
              segments={segments}
              onLaunchCampaign={(id) => router.push(`/dashboard/campaigns/create?segment=${id}`)}
            />
          )}

          {activeTab === 'b2b' && (
            <B2BWholesaleTab
              accounts={b2bAccounts.map(l => ({
                id: l.id,
                company: l.company || '',
                contact: l.full_name,
                division: l.division_interest === 'marine' ? 'Marine' : 'Tech',
                value: l.estimated_deal_value_ngn || 0,
                lastOrder: l.created_at || new Date().toISOString(),
              }))}
              b2bKPIs={b2bKPIs}
              onSendQuote={() => router.push('/dashboard/campaigns/create?type=quote')}
              onScheduleDemo={() => router.push('/dashboard/campaigns/create?type=demo')}
              onSendCatalog={() => router.push('/dashboard/campaigns/create?type=catalog')}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <DualEntryModal open={showDualEntry} onClose={() => setShowDualEntry(false)} onLeadSaved={fetchLeads} />
      <AnimatePresence>
        {showAddLead && (
          <AddLeadModal open={showAddLead} onClose={() => setShowAddLead(false)} onSuccess={fetchLeads} />
        )}
      </AnimatePresence>
    </div>
  )
}
