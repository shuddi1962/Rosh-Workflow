'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, RefreshCw, Search, Target, TrendingUp, AlertCircle, BarChart3, Zap } from 'lucide-react'
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

export default function DashboardCompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [scanning, setScanning] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
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
      const data = await res.json()
      setCompetitors(data.competitors || data || [])
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
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/competitors/gap-analysis', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to run gap analysis')
      await fetchCompetitors()
    } catch (err) {
      console.error('Error running gap analysis:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this competitor?')) return
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`/api/competitors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchCompetitors()
    } catch (err) {
      console.error('Error deleting competitor:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="font-clash text-3xl font-bold text-gray-900 mb-2">Competitor Spy</h1>
            <p className="text-gray-600">Monitor competitors and discover content gaps</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleGapAnalysis}
              disabled={analyzing || competitors.length === 0}
              variant="outline"
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Competitor
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          Error: {error}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-clash text-lg font-semibold text-gray-900 mb-4">Add New Competitor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Input
                value={newCompetitor.name}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                placeholder="Competitor name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <Input
                value={newCompetitor.website}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
              <select
                value={newCompetitor.division}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, division: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="marine">Marine</option>
                <option value="tech">Technology</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
              <Input
                value={newCompetitor.facebook_url}
                onChange={(e) => setNewCompetitor({ ...newCompetitor, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {competitors.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No competitors added yet. Add competitors to start monitoring.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Total Competitors</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 font-mono">{competitors.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">Marine Division</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 font-mono">
                {competitors.filter(c => c.division === 'marine').length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600">Tech Division</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 font-mono">
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
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-clash text-lg font-semibold text-gray-900 mb-1">
                    {competitor.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {competitor.website && (
                      <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        {competitor.website}
                      </a>
                    )}
                    <Badge variant={competitor.division === 'marine' ? 'default' : 'info'}
                      className={competitor.division === 'marine' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
                    >
                      {competitor.division}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
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
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(competitor.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {competitor.intel_report && (
                <div className="space-y-3">
                  {competitor.intel_report.top_performing_posts && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Top Posts:</p>
                      {competitor.intel_report.top_performing_posts.slice(0, 2).map((post, i) => (
                        <div key={i} className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-1">
                          <Badge variant="info" className="mr-2">{post.platform}</Badge>
                          {post.content}
                        </div>
                      ))}
                    </div>
                  )}

                  {competitor.intel_report.content_gaps && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Content Gaps:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.intel_report.content_gaps.slice(0, 5).map((gap, i) => (
                          <Badge key={i} variant="warning" className="text-xs">{gap}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {competitor.active_ads && competitor.active_ads.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Active Ads: {competitor.active_ads.length}</p>
                </div>
              )}

              <div className="mt-3 text-xs text-gray-400">
                Last scanned: {competitor.last_scanned ? new Date(competitor.last_scanned).toLocaleString() : 'Never'}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
