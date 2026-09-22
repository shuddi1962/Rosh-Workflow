'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, RefreshCw, Search, Target, TrendingUp, AlertCircle, BarChart3, Zap, ExternalLink, PenLine, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Competitor {
  id: string
  name: string
  website: string
  facebook_url: string
  instagram_url: string
  division: string
  last_scanned: string | null
  intel_report: {
    posting_frequency?: Array<{ platform: string; posts_per_week: number }>
    top_performing_posts?: Array<{ platform: string; content: string; engagement: number }>
    active_ads?: Array<{ ad_type: string; copy_angle: string }>
    content_gaps?: string[]
    [key: string]: unknown
  } | null
  active_ads: Array<{
    ad_type: string
    creative_description: string
    copy_angle: string
    cta: string
  }>
  created_at: string
}

interface GapReport {
  content_gaps: string[]
  audience_gaps: string[]
  offer_gaps: string[]
  roshanal_weaknesses: Array<{ weakness: string; competitor_doing_it: string; recommended_fix: string; priority: string }>
  competitors_scanned: number
  generated_at: string
}

export default function DashboardCompetitorsPage() {
  const router = useRouter()
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [scanning, setScanning] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [gapReport, setGapReport] = useState<GapReport | null>(null)
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    website: '',
    division: 'marine',
    facebook_url: '',
    instagram_url: '',
  })

  const fetchCompetitors = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/competitors', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch competitors')
      const data = await res.json() as { competitors?: Competitor[] } | Competitor[]
      setCompetitors(Array.isArray(data) ? data : (data.competitors ?? []))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompetitors()
  }, [])

  const handleAddCompetitor = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCompetitor)
      })
      if (!res.ok) throw new Error('Failed to add competitor')
      setShowAddForm(false)
      setNewCompetitor({ name: '', website: '', division: 'marine', facebook_url: '', instagram_url: '' })
      fetchCompetitors()
    } catch (err) {
      console.error('Error adding competitor:', err)
    }
  }

  const handleScan = async (id: string) => {
    try {
      setScanning(id)
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/competitors/${id}/scrape`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchCompetitors()
    } catch (err) {
      console.error('Error scanning competitor:', err)
    } finally {
      setScanning(null)
    }
  }

  const handleGapAnalysis = async () => {
    try {
      setAnalyzing(true)
      setError('')
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/competitors/gap-analysis', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json() as { report?: GapReport; error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed to run gap analysis')
      if (data.report) setGapReport(data.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-0">
      <PageHeader
        eyebrow="Competitor Spy"
        title="Market Intelligence"
        description="Track competitor ads and content, expose gaps, steal winning angles."
        icon={Eye}
        actions={
          <>
            <Button
              onClick={handleGapAnalysis}
              disabled={analyzing || competitors.length === 0}
              variant="outline"
              className="bg-white"
            >
              {analyzing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Gap Analysis
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-accent-primary hover:bg-accent-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Competitor
            </Button>
          </>
        }
      />

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 text-accent-red mb-6">
          Error: {error}
        </div>
      )}

      {gapReport && (
        <div className="bg-white rounded-xl border border-accent-gold/40 border-l-4 border-l-accent-gold p-6 mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-gold" />
            Gap Analysis Report
          </h3>
          <p className="text-xs text-text-muted mb-4">
            {gapReport.competitors_scanned} competitor(s) scanned • {new Date(gapReport.generated_at).toLocaleString()}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Content Gaps</p>
              {gapReport.content_gaps.length === 0 ? (
                <p className="text-xs text-text-muted">No content gaps found yet — scan competitors first.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {gapReport.content_gaps.slice(0, 8).map((gap, i) => (
                    <Badge key={i} className="text-xs bg-accent-gold/10 text-accent-gold border border-accent-gold/20">{gap}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Audience Gaps</p>
              {gapReport.audience_gaps.length === 0 ? (
                <p className="text-xs text-text-muted">No audience gaps found yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {gapReport.audience_gaps.slice(0, 8).map((gap, i) => (
                    <Badge key={i} className="text-xs bg-accent-primary/10 text-accent-primary border border-accent-primary/20">{gap}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Offer Gaps</p>
              {gapReport.offer_gaps.length === 0 ? (
                <p className="text-xs text-text-muted">No offer gaps found yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {gapReport.offer_gaps.slice(0, 8).map((gap, i) => (
                    <Badge key={i} className="text-xs bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">{gap}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          {gapReport.roshanal_weaknesses.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-sm font-medium text-text-primary mb-2">What Roshanal Should Fix</p>
              <div className="space-y-2">
                {gapReport.roshanal_weaknesses.slice(0, 5).map((w, i) => (
                  <div key={i} className="text-xs bg-bg-surface rounded-lg p-3">
                    <span className="font-semibold text-accent-red uppercase">[{w.priority}]</span>{' '}
                    <span className="text-text-primary font-medium">{w.weakness}</span>
                    <span className="text-text-secondary"> — {w.recommended_fix}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button
            size="sm"
            onClick={() => router.push('/dashboard/content/ideas')}
            className="mt-4 bg-accent-primary hover:bg-accent-primary/90 text-white"
          >
            <PenLine className="w-3 h-3 mr-2" />
            Turn Gaps Into Content
          </Button>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-xl border border-border-subtle p-6 mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Add New Competitor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
              <Input
                value={newCompetitor.name}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                placeholder="Competitor name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Website</label>
              <Input
                value={newCompetitor.website}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Division</label>
              <select
                value={newCompetitor.division}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, division: e.target.value })}
                className="w-full p-2 border border-border-subtle rounded-lg bg-white text-text-primary"
              >
                <option value="marine">Marine</option>
                <option value="tech">Technology</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Facebook URL</label>
              <Input
                value={newCompetitor.facebook_url}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Instagram URL</label>
              <Input
                value={newCompetitor.instagram_url}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAddCompetitor}
              className="bg-accent-primary hover:bg-accent-primary/90 text-white"
            >
              Add Competitor
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {competitors.length === 0 ? (
          <div className="col-span-full text-center py-12 text-text-muted">
            <Search className="w-12 h-12 mx-auto mb-4 text-text-muted/50" />
            <p>No competitors added yet. Add competitors to start monitoring.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-border-subtle p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-accent-primary" />
                <span className="text-sm text-text-secondary">Total Competitors</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{competitors.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-border-subtle p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent-primary" />
                <span className="text-sm text-text-secondary">Marine Division</span>
              </div>
              <p className="text-2xl font-bold text-accent-primary">
                {competitors.filter(c => c.division === 'marine').length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border-subtle p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-accent-gold" />
                <span className="text-sm text-text-secondary">Tech Division</span>
              </div>
              <p className="text-2xl font-bold text-accent-gold">
                {competitors.filter(c => c.division === 'tech').length}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {competitors.map((competitor) => (
            <motion.div
              key={competitor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl border border-border-subtle p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {competitor.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-text-muted flex-wrap">
                    {competitor.website && (
                      <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="hover:text-accent-primary truncate">
                        {competitor.website}
                      </a>
                    )}
                    <Badge
                      className={competitor.division === 'marine' ? 'bg-accent-primary/10 text-accent-primary' : 'bg-accent-emerald/10 text-accent-emerald'}
                    >
                      {competitor.division}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleScan(competitor.id)}
                    disabled={scanning === competitor.id}
                  >
                    {scanning === competitor.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    Scan
                  </Button>
                  {competitor.website && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={competitor.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit Site
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => router.push('/dashboard/content/ideas')}
                    className="bg-accent-primary hover:bg-accent-primary/90 text-white"
                  >
                    <PenLine className="w-3 h-3 mr-1" />
                    Steal Angle
                  </Button>
                </div>
              </div>

              {competitor.intel_report && (
                <div className="space-y-3">
                  {competitor.intel_report.top_performing_posts && (
                    <div>
                      <p className="text-sm font-medium text-text-secondary mb-2">Top Posts:</p>
                      {competitor.intel_report.top_performing_posts.slice(0, 2).map((post, i) => (
                        <div key={i} className="text-xs text-text-secondary bg-bg-surface p-2 rounded mb-1">
                          <Badge className="mr-2 bg-accent-primary/10 text-accent-primary">{post.platform}</Badge>
                          {post.content}
                        </div>
                      ))}
                    </div>
                  )}

                  {competitor.intel_report.content_gaps && (
                    <div>
                      <p className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Content Gaps:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.intel_report.content_gaps.slice(0, 5).map((gap, i) => (
                          <Badge key={i} className="text-xs bg-accent-gold/10 text-accent-gold border border-accent-gold/20">{gap}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {competitor.active_ads && competitor.active_ads.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <p className="text-sm font-medium text-text-secondary mb-2">Active Ads: {competitor.active_ads.length}</p>
                </div>
              )}

              <div className="mt-3 text-xs text-text-muted">
                Last scanned: {competitor.last_scanned ? new Date(competitor.last_scanned).toLocaleString() : 'Never'}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
