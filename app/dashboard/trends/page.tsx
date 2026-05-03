'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { Loader2, RefreshCw, TrendingUp, Flame, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Trend {
  id: string
  keyword: string
  topic: string
  description: string
  source: string
  momentum_score: number
  division_relevance: string
  matched_products: string[]
  is_breaking: boolean
  status: string
  discovered_at: string
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchTrends = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/trends', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch trends')
      const data = await res.json()
      setTrends(data.trends || data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrends()
  }, [])

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/trends/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to refresh trends')
      await fetchTrends()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setRefreshing(false)
    }
  }

  const handleMatchProduct = async (trendId: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch('/api/trends/match-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ trend_id: trendId })
      })
      fetchTrends()
    } catch (err) {
      console.error('Error matching product:', err)
    }
  }

  const filteredTrends = filter === 'all'
    ? trends
    : filter === 'marine'
    ? trends.filter(t => t.division_relevance === 'marine')
    : filter === 'tech'
    ? trends.filter(t => t.division_relevance === 'tech')
    : trends.filter(t => t.is_breaking)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent-red bg-accent-red/10'
    if (score >= 60) return 'text-accent-orange bg-accent-orange/10'
    if (score >= 40) return 'text-accent-gold bg-accent-gold/10'
    return 'text-text-secondary bg-bg-surface'
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-clash text-3xl font-bold text-text-primary mb-2">Live Trend Monitor</h1>
          <p className="text-text-secondary">Real-time trending topics for marine and tech divisions</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh Trends
        </Button>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 text-accent-red mb-6">
          Error: {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {['all', 'marine', 'tech', 'breaking'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            size="sm"
            className={filter === f ? 'bg-accent-primary hover:bg-accent-primary/90' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'breaking' && <Flame className="w-3 h-3 ml-1" />}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-border-subtle p-6">
          <h3 className="font-clash text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-primary" />
            Marine Trends
          </h3>
          <div className="space-y-3">
            {filteredTrends.filter(t => t.division_relevance === 'marine').length === 0 ? (
              <p className="text-text-muted text-sm">No marine trends found</p>
            ) : (
              filteredTrends
                .filter(t => t.division_relevance === 'marine')
                .slice(0, 5)
                .map((trend) => (
                  <motion.div
                    key={trend.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-bg-surface rounded-lg border-l-4 border-accent-primary"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-text-primary text-sm font-medium">{trend.keyword}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getScoreColor(trend.momentum_score)}`}>
                        {trend.momentum_score}
                      </span>
                    </div>
                    <p className="text-text-muted text-xs">{trend.source} • Marine Division</p>
                  </motion.div>
                ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-subtle p-6">
          <h3 className="font-clash text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-purple" />
            Tech Trends
          </h3>
          <div className="space-y-3">
            {filteredTrends.filter(t => t.division_relevance === 'tech').length === 0 ? (
              <p className="text-text-muted text-sm">No tech trends found</p>
            ) : (
              filteredTrends
                .filter(t => t.division_relevance === 'tech')
                .slice(0, 5)
                .map((trend) => (
                  <motion.div
                    key={trend.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-bg-surface rounded-lg border-l-4 border-accent-purple"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-text-primary text-sm font-medium">{trend.keyword}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getScoreColor(trend.momentum_score)}`}>
                        {trend.momentum_score}
                      </span>
                    </div>
                    <p className="text-text-muted text-xs">{trend.source} • Tech Division</p>
                  </motion.div>
                ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-subtle p-6">
        <h3 className="font-clash text-lg font-semibold text-text-primary mb-4">All Trends</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTrends.map((trend) => (
              <motion.div
                key={trend.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-bg-surface rounded-lg border border-border-ghost hover:border-border-subtle transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {trend.is_breaking && (
                        <Badge className="bg-accent-red/10 text-accent-red">
                          <Flame className="w-3 h-3 mr-1" />
                          Breaking
                        </Badge>
                      )}
                      <span className="text-text-primary text-sm font-medium">{trend.keyword}</span>
                    </div>
                    <p className="text-text-secondary text-xs mb-2">{trend.description}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge
                        variant={trend.division_relevance === 'marine' ? 'default' : 'info'}
                        className={trend.division_relevance === 'marine' ? 'bg-accent-primary/10 text-accent-primary' : 'bg-accent-purple/10 text-accent-purple'}
                      >
                        {trend.division_relevance}
                      </Badge>
                      <span className="text-xs text-text-muted">{trend.source}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getScoreColor(trend.momentum_score)}`}>
                        Score: {trend.momentum_score}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMatchProduct(trend.id)}
                  >
                    Match Product
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTrends.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              <Info className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
              No trends found. Click "Refresh Trends" to fetch the latest trends.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
