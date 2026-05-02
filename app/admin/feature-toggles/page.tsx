'use client'

import { useState, useEffect } from 'react'

interface Toggle {
  feature_key: string
  is_enabled: boolean
  id?: string
  value?: unknown
}

const TOGGLE_LABELS: Record<string, { label: string; description: string; category: string }> = {
  auto_trend_discovery: { label: 'Auto Trend Discovery', description: 'Automatically fetch trending topics every 30 minutes', category: 'Content' },
  auto_competitor_monitoring: { label: 'Auto Competitor Monitoring', description: 'Monitor competitor social media and ads daily', category: 'Intelligence' },
  auto_post_enabled: { label: 'Auto Post Enabled', description: 'Automatically publish scheduled posts', category: 'Social' },
  ai_content_generation: { label: 'AI Content Generation', description: 'Enable Claude API for content generation', category: 'Content' },
  image_generation: { label: 'Image Generation', description: 'Enable AI-powered image generation for posts', category: 'Creative' },
  ugc_ad_generation: { label: 'UGC Ad Generation', description: 'Allow AI-generated UGC ad scripts and copy', category: 'Creative' },
  lead_scraping: { label: 'Lead Scraping', description: 'Enable Apify lead scraping from Google Maps and LinkedIn', category: 'Leads' },
  email_campaigns: { label: 'Email Campaigns', description: 'Enable SendGrid email campaign sending', category: 'Campaigns' },
  sms_campaigns: { label: 'SMS Campaigns', description: 'Enable Twilio SMS campaign sending', category: 'Campaigns' },
  whatsapp_campaigns: { label: 'WhatsApp Campaigns', description: 'Enable WhatsApp Business API broadcasts', category: 'Campaigns' },
  instagram_auto_post: { label: 'Instagram Auto Post', description: 'Auto-publish to Instagram Business', category: 'Social' },
  facebook_auto_post: { label: 'Facebook Auto Post', description: 'Auto-publish to Facebook Pages', category: 'Social' },
  whatsapp_status_auto: { label: 'WhatsApp Status Auto', description: 'Auto-post to WhatsApp Status', category: 'Social' },
  linkedin_auto_post: { label: 'LinkedIn Auto Post', description: 'Auto-publish to LinkedIn Company Page', category: 'Social' },
  twitter_auto_post: { label: 'Twitter Auto Post', description: 'Auto-publish to Twitter/X', category: 'Social' },
  tiktok_auto_post: { label: 'TikTok Auto Post', description: 'Auto-publish to TikTok', category: 'Social' },
}

export default function FeatureTogglesPage() {
  const [toggles, setToggles] = useState<Toggle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)

  useEffect(() => {
    fetchToggles()
  }, [])

  const fetchToggles = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/admin/feature-toggles', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.toggles) {
        setToggles(data.toggles)
      } else {
        const defaults = Object.keys(TOGGLE_LABELS).map(key => ({
          feature_key: key,
          is_enabled: false
        }))
        setToggles(defaults)
      }
    } catch (error) {
      console.error('Error fetching toggles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (key: string, enabled: boolean) => {
    setSaving(key)
    setSavedKey(null)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/admin/feature-toggles/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_enabled: enabled }),
      })
      if (res.ok) {
        setToggles(toggles.map(t => t.feature_key === key ? { ...t, is_enabled: enabled } : t))
        setSavedKey(key)
        setTimeout(() => setSavedKey(null), 2000)
      }
    } catch (error) {
      console.error('Error saving toggle:', error)
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <div className="p-6 text-gray-600">Loading toggles...</div>

  const categories = [...new Set(Object.values(TOGGLE_LABELS).map(t => t.category))]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-clash font-bold text-gray-900 mb-2">Feature Toggles</h1>
      <p className="text-gray-600 mb-8">Enable or disable platform features in real-time.</p>

      {categories.map(category => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {toggles.filter(t => TOGGLE_LABELS[t.feature_key]?.category === category).map(toggle => {
              const config = TOGGLE_LABELS[toggle.feature_key]
              const isSaving = saving === toggle.feature_key
              const isSaved = savedKey === toggle.feature_key

              return (
                <div key={toggle.feature_key} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{config?.label || toggle.feature_key}</p>
                    <p className="text-gray-500 text-sm">{config?.description || ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSaved && <span className="text-emerald-600 text-xs font-medium">Saved!</span>}
                    <button
                      onClick={() => handleToggle(toggle.feature_key, !toggle.is_enabled)}
                      disabled={isSaving}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${toggle.is_enabled ? 'bg-blue-600' : 'bg-gray-300'} ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${toggle.is_enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
