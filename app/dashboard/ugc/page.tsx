'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdCreator } from '@/components/ugc/ad-creator'
import { AdPreview } from '@/components/ugc/ad-preview'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, RefreshCw, Trash2, Send, Megaphone, Clapperboard } from 'lucide-react'
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

type AdFilter = 'all' | 'marine' | 'tech' | 'used'

export default function UGCPage() {
  const router = useRouter()
  const [ads, setAds] = useState<UGCAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<AdFilter>('all')
  const [selectedAd, setSelectedAd] = useState<UGCAd | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAds = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/ugc/ads', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch ads')
      const data = await res.json() as { ads?: UGCAd[] } | UGCAd[]
      setAds(Array.isArray(data) ? data : (data.ads ?? []))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad?')) return
    try {
      setDeleting(true)
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/ugc/ads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedAd(null)
      fetchAds()
    } catch (err) {
      console.error('Error deleting ad:', err)
    } finally {
      setDeleting(false)
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
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0">
      <PageHeader
        eyebrow="UGC Ad Creator"
        title="Creative Studio"
        description="Customer-style video ad scripts and creatives that feel authentic."
        icon={Clapperboard}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/campaigns')}
              className="bg-white border-border-subtle text-text-primary hover:bg-bg-surface"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Campaigns
            </Button>
            <Button
              onClick={fetchAds}
              variant="outline"
              className="bg-white border-border-subtle text-text-primary hover:bg-bg-surface"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </>
        }
      />

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 text-accent-red mb-6">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
        {(['all', 'marine', 'tech', 'used'] as AdFilter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-accent-primary hover:bg-accent-primary/90 text-white' : 'bg-white border-border-subtle text-text-secondary hover:bg-bg-surface hover:text-text-primary'}
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
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAd(null)}
                  className="bg-white border-border-subtle text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                >
                  Back to List
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/social')}
                  className="bg-accent-primary hover:bg-accent-primary/90 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Schedule to Social
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/campaigns')}
                  variant="outline"
                  className="bg-white border-border-subtle text-text-primary hover:bg-bg-surface"
                >
                  <Megaphone className="w-4 h-4 mr-2" />
                  Use in Campaign
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedAd.id)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
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

      <div className="bg-white border border-border-subtle rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Generated Ads</h3>
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
                  className="p-4 bg-bg-surface rounded-lg border border-border-subtle hover:border-accent-primary/50 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-accent-gold flex-shrink-0" />
                        <span className="text-sm font-medium text-text-primary truncate">
                          {ad.headline || adTypeLabels[ad.ad_type] || ad.ad_type}
                        </span>
                      </div>
                      <p className="text-text-secondary text-xs line-clamp-2">
                        {ad.primary_text || ad.description}
                      </p>
                    </div>
                    <Badge
                      className={ad.used_in_campaign ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 flex-shrink-0' : 'bg-accent-primary/10 text-accent-primary flex-shrink-0'}>
                      {ad.used_in_campaign ? 'Used' : 'New'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-white text-text-secondary border border-border-subtle">{ad.division}</Badge>
                    <Badge className="bg-white text-text-secondary border border-border-subtle">{ad.platform}</Badge>
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
