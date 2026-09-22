'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CampaignList } from '@/components/campaigns/campaign-list'
import { CampaignEditor } from '@/components/campaigns/campaign-editor'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, RefreshCw, Mail, MessageSquare, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/dashboard/PageHeader'

interface Campaign {
  id: string
  name: string
  type: string
  division: string
  status: string
  scheduled_at: string | null
  sent_at: string | null
  stats: {
    total_recipients: number
    sent: number
    delivered: number
    failed: number
    opened: number
    clicked: number
  }
  created_at: string
}

export default function DashboardCampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns || data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleSave = async (campaignData: Record<string, unknown>) => {
    try {
      const token = localStorage.getItem('accessToken')
      const url = selectedCampaign ? `/api/campaigns/${selectedCampaign.id}` : '/api/campaigns'
      const method = selectedCampaign ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(campaignData)
      })

      if (!res.ok) throw new Error('Failed to save campaign')
      setShowEditor(false)
      setSelectedCampaign(null)
      fetchCampaigns()
    } catch (err) {
      console.error('Error saving campaign:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchCampaigns()
    } catch (err) {
      console.error('Error deleting campaign:', err)
    }
  }

  const handleSend = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/campaigns/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchCampaigns()
    } catch (err) {
      console.error('Error sending campaign:', err)
    }
  }

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto">
      <PageHeader
        eyebrow="Marketing"
        title="Outreach Campaigns"
        description="WhatsApp, email and SMS campaigns that turn contacts into customers."
        actions={
          <>
            <Button onClick={fetchCampaigns} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => router.push('/dashboard/campaigns/create')}
              className="bg-accent-primary hover:bg-accent-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/campaigns/templates')}>
          <Mail className="w-4 h-4 mr-2" /> Email Templates
        </Button>
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/campaigns/automation')}>
          <Send className="w-4 h-4 mr-2" /> Automation Rules
        </Button>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 text-accent-red mb-6">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-secondary">Total</span>
          </div>
          <p className="text-2xl font-bold text-text-primary font-mono">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-border-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-accent-emerald" />
            <span className="text-sm text-text-secondary">Sent</span>
          </div>
          <p className="text-2xl font-bold text-accent-emerald font-mono">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-xl border border-border-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-accent-primary" />
            <span className="text-sm text-text-secondary">Scheduled</span>
          </div>
          <p className="text-2xl font-bold text-accent-primary font-mono">{stats.scheduled}</p>
        </div>
        <div className="bg-white rounded-xl border border-border-subtle p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-text-secondary">Drafts</span>
          </div>
          <p className="text-2xl font-bold text-accent-gold font-mono">{stats.draft}</p>
        </div>
      </div>

      {showEditor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <CampaignEditor
            onSave={handleSave}
            onCancel={() => {
              setShowEditor(false)
              setSelectedCampaign(null)
            }}
            campaign={selectedCampaign as unknown as Record<string, unknown> || undefined}
          />
        </motion.div>
      )}

      <CampaignList
        campaigns={campaigns as unknown as Array<Record<string, unknown>>}
        onEdit={(campaign: Record<string, unknown>) => {
          setSelectedCampaign(campaign as unknown as Campaign)
          setShowEditor(true)
        }}
        onDelete={handleDelete}
        onSend={handleSend}
      />
    </div>
  )
}
