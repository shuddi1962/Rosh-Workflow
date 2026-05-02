'use client'

import { useState, useEffect } from 'react'
import { AdCreator } from '@/components/ugc/ad-creator'
import { AdPreview } from '@/components/ugc/ad-preview'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, RefreshCw, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UGCAd {
  id: string
  division: string
  ad_type: string
  platform: string
  headline: string
  primary_text: string
  description: string
  cta_button: string
  video_script: string
  status: string
  used_in_campaign: boolean
  created_at: string
}

const adTypeLabels: Record<string, string> = {
  testimonial: 'Customer Testimonial',
  unboxing: 'Product Unboxing',
  installation: 'Installation Walkthrough',
  problem_solution: 'Problem → Solution',
  day_in_life: 'Day in the Life',
  facebook_lead: 'Facebook Lead Ad',
  carousel: 'Carousel Ad',
  story: 'Story Ad (15s)',
  whatsapp_broadcast: 'WhatsApp Broadcast',
  whatsapp_status: 'WhatsApp Status',
  google_search: 'Google Search Ad',
  email_blast: 'Email Blast',
  sms_blast: 'SMS Blast',
}

export default function UGCPage() {
  const [ads, setAds] = useState<UGCAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedAd, setSelectedAd] = useState<UGCAd | null>(null)

  const fetchAds = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/ugc/ads', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch ads')
      const data = await res.json()
      setAds(data.ads || data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const handleGenerate = async (adData: Record<string, unknown>) => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/ugc/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adData)
      })
      if (!res.ok) throw new Error('Failed to generate ad')
      await fetchAds()
    } catch (err) {
      console.error('Error generating ad:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/ugc/ads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedAd(null)
      fetchAds()
    } catch (err) {
      console.error('Error deleting ad:', err)
    }
  }

  const filteredAds = filter === 'all'
    ? ads
    : filter === 'used'
    ? ads.filter(a => a.used_in_campaign)
    : ads.filter(a => a.division === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary-glow" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="font-clash text-3xl font-bold text-text-primary mb-2">UGC Ad Creator</h1>
            <p className="text-text-secondary">Generate ad scripts and creative content for all platforms</p>
          </div>
          <Button
            onClick={fetchAds}
            variant="outline"
            className="border-border-subtle text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 text-accent-red mb-6">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {['all', 'marine', 'tech', 'used'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-accent-primary hover:bg-accent-primary/90 text-white' : 'border-border-subtle text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}
          >
            {f === 'used' ? 'Used in Campaigns' : f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <AdCreator />
        </div>

        <div>
          {selectedAd ? (
            <div className="space-y-4">
              <AdPreview
                headline={selectedAd.headline}
                primaryText={selectedAd.primary_text}
                ctaButton={selectedAd.cta_button}
                videoScript={selectedAd.video_script}
                adType={selectedAd.ad_type}
                platform={selectedAd.platform}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAd(null)}
                  className="border-border-subtle text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                >
                  Back to List
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedAd.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">Select an ad to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6">
        <h3 className="font-clash text-lg font-semibold text-text-primary mb-4">Generated Ads</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {filteredAds.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-8">
                No ads generated yet. Use the creator above to generate UGC ads.
              </p>
            ) : (
              filteredAds.map((ad) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedAd(ad)}
                  className="p-4 bg-bg-elevated rounded-lg border border-border-subtle hover:border-accent-primary/50 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-accent-purple" />
                        <span className="text-sm font-medium text-text-primary">
                          {ad.headline || adTypeLabels[ad.ad_type] || ad.ad_type}
                        </span>
                      </div>
                      <p className="text-text-secondary text-xs line-clamp-2">
                        {ad.primary_text || ad.description}
                      </p>
                    </div>
                    <Badge variant={ad.used_in_campaign ? 'default' : 'info'}
                      className={ad.used_in_campaign ? 'bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30' : ''}>
                      {ad.used_in_campaign ? 'Used' : 'New'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info" className="bg-bg-surface text-text-secondary border-border-subtle">{ad.division}</Badge>
                    <Badge variant="info" className="bg-bg-surface text-text-secondary border-border-subtle">{ad.platform}</Badge>
                    <span className="text-xs text-text-muted">
                      {adTypeLabels[ad.ad_type] || ad.ad_type}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
