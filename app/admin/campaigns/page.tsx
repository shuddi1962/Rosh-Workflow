'use client'

import { useState, useEffect } from 'react'
import { CampaignList } from '@/components/campaigns/campaign-list'
import { CampaignEditor } from '@/components/campaigns/campaign-editor'

interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'whatsapp'
  division: 'marine' | 'tech' | 'both'
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  target_leads: string[]
  message_template: string
  subject?: string
  scheduled_at?: string
  created_at: string
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/campaigns', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (campaign: Partial<Campaign>) => {
    try {
      const token = localStorage.getItem('accessToken')
      const isEdit = !!campaign.id
      const res = await fetch(isEdit ? `/api/campaigns/${campaign.id}` : '/api/campaigns', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(campaign),
      })
      if (res.ok) {
        setShowEditor(false)
        setEditingCampaign(null)
        fetchCampaigns()
      }
    } catch (error) {
      console.error('Error saving campaign:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setCampaigns(campaigns.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }

  if (loading) return <div className="p-6 text-gray-600">Loading campaigns...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-gray-900">Campaign Management</h1>
        <button onClick={() => { setEditingCampaign(null); setShowEditor(true) }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">+ Create Campaign</button>
      </div>

      <CampaignList
        campaigns={campaigns as unknown as Array<Record<string, unknown>>}
        onEdit={(campaign: Record<string, unknown>) => { setEditingCampaign(campaign as unknown as Campaign); setShowEditor(true) }}
        onDelete={handleDelete}
      />

      {showEditor && (
        <CampaignEditor
          campaign={editingCampaign as unknown as Record<string, unknown>}
          onSave={handleSave}
          onCancel={() => { setShowEditor(false); setEditingCampaign(null) }}
        />
      )}
    </div>
  )
}
