'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, TrendingUp, Flame, Info, Anchor, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react'
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

interface Product {
  id: string
  name: string
  division: string
}

type TrendFilter = 'all' | 'marine' | 'tech' | 'breaking'

export default function TrendsPage() {
  const router = useRouter()
  const [trends, setTrends] = useState<Trend[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<TrendFilter>('all')
  const [selectedProducts, setSelectedProducts] = useState<Record<string, string>>({})
  const [matchingId, setMatchingId] = useState<string | null>(null)
  const [matchMessage, setMatchMessage] = useState<Record<string, string>>({})

  const fetchTrends = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/trends', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch trends')
      const data = await res.json() as { trends?: Trend[] } | Trend[]
      setTrends(Array.isArray(data) ? data : (data.trends ?? []))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json() as { products?: Product[] } | Product[]
      setProducts(Array.isArray(data) ? data : (data.products ?? []))
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  useEffect(() => {
    fetchTrends()
    fetchProducts()
  }, [])

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      setError('')
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/trends/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json() as { trends?: Trend[]; error?: string }
      if (res.ok) {
        setTrends(data.trends ?? [])
      } else {
        setError(data.error || 'Failed to refresh trends')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setRefreshing(false)
    }
  }

  const handleMatchProduct = async (trendId: string) => {
    const productId = selectedProducts[trendId]
    if (!productId) {
      setMatchMessage(prev => ({ ...prev, [trendId]: 'Select a product first' }))
      return
    }
    try {
      setMatchingId(trendId)
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/trends/match-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ trend_id: trendId, product_id: productId })
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed to match product')
      setMatchMessage(prev => ({ ...prev, [trendId]: 'Matched successfully' }))
      fetchTrends()
    } catch (err) {
      setMatchMessage(prev => ({ ...prev, [trendId]: err instanceof Error ? err.message : 'Match failed' }))
    } finally {
      setMatchingId(null)
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
    <div className="max-w-full mx-auto px-4 sm:px-0">
      <PageHeader
        eyebrow="Live Trend Monitor"
        title="Market Intelligence"
        description="Live signals from Google, news and social — turned into content opportunities."
        icon={TrendingUp}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/content')}
              className="bg-white border-border-subtle text-text-primary hover:bg-bg-surface"
            >
              Create Content
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
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
          </>
        }
      />

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 text-accent-red mb-6">
          Error: {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'marine', 'tech', 'breaking'] as TrendFilter[]).map((f) => (
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
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Anchor className="w-5 h-5 text-accent-primary" />
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
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-accent-primary" />
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
                    className="p-3 bg-bg-surface rounded-lg border-l-4 border-accent-primary"
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
        <h3 className="text-lg font-semibold text-text-primary mb-4">All Trends</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTrends.map((trend) => (
              <motion.div
                key={trend.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-bg-surface rounded-lg border border-border-subtle hover:border-accent-primary/40 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                        className={trend.division_relevance === 'marine' ? 'bg-accent-primary/10 text-accent-primary' : 'bg-accent-emerald/10 text-accent-emerald'}
                      >
                        {trend.division_relevance}
                      </Badge>
                      <span className="text-xs text-text-muted">{trend.source}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getScoreColor(trend.momentum_score)}`}>
                        Score: {trend.momentum_score}
                      </span>
                      {(trend.matched_products?.length ?? 0) > 0 && (
                        <span className="text-xs text-accent-emerald flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {trend.matched_products.length} product{(trend.matched_products.length > 1) ? 's' : ''} matched
                        </span>
                      )}
                    </div>
                    {matchMessage[trend.id] && (
                      <p className="text-xs text-text-secondary mt-2">{matchMessage[trend.id]}</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-shrink-0">
                    <select
                      value={selectedProducts[trend.id] ?? ''}
                      onChange={(e) => setSelectedProducts(prev => ({ ...prev, [trend.id]: e.target.value }))}
                      className="text-xs p-2 border border-border-subtle rounded-lg bg-white text-text-primary min-w-[160px]"
                      aria-label={`Select product to match with ${trend.keyword}`}
                    >
                      <option value="">Select product…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.division})
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMatchProduct(trend.id)}
                      disabled={matchingId === trend.id}
                    >
                      {matchingId === trend.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Match Product'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTrends.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              <Info className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
              No trends found. Click &quot;Refresh Trends&quot; to fetch the latest trends.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
