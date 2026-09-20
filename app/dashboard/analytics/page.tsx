'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { Loader2, BarChart3, TrendingUp, Users, Megaphone } from 'lucide-react'
import { motion } from 'framer-motion'

interface Overview {
  total_reach: number
  posts_this_week: number
  leads_generated: number
  campaigns_sent: number
  reach_change: number
  posts_change: number
  leads_change: number
  campaigns_change: number
}

interface SocialStats {
  platform_breakdown: Array<{ platform: string; count: number }>
  top_posts: Array<{ id: string; caption: string; engagement: number }>
  best_post_type: string
  best_day: string
}

interface CampaignStats {
  total_sent: number
  total_opened: number
  total_clicked: number
  by_type: Array<{ type: string; count: number }>
}

export default function DashboardAnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [socialStats, setSocialStats] = useState<SocialStats | null>(null)
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('accessToken')

        const [overviewRes, socialRes, campaignsRes] = await Promise.all([
          fetch('/api/analytics/overview', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/analytics/social', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/analytics/campaigns', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        if (overviewRes.ok) {
          const data = await overviewRes.json()
          setOverview(data.overview || data)
        }

        if (socialRes.ok) {
          const data = await socialRes.json()
          setSocialStats(data.stats || data)
        }

        if (campaignsRes.ok) {
          const data = await campaignsRes.json()
          setCampaignStats(data.stats || data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
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
        <h1 className="font-clash text-3xl font-bold text-text-primary mb-2">Analytics Dashboard</h1>
        <p className="text-text-secondary">Track your marketing performance and campaign results</p>
      </motion.div>

      {error && (
        <div className="bg-accent-red/5 border border-accent-red/20 rounded-lg p-4 text-accent-red mb-6">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-border-subtle p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent-primary" />
            <span className="text-sm text-text-secondary">Total Reach</span>
          </div>
          <p className="text-3xl font-bold text-text-primary font-mono">
            {overview?.total_reach?.toLocaleString() || '0'}
          </p>
          <p className={`text-sm mt-1 ${overview && overview.reach_change >= 0 ? 'text-accent-emerald' : 'text-accent-red'}`}>
            {overview && overview.reach_change >= 0 ? '+' : ''}{overview?.reach_change || 0}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-border-subtle p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-accent-emerald" />
            <span className="text-sm text-text-secondary">Posts This Week</span>
          </div>
          <p className="text-3xl font-bold text-text-primary font-mono">
            {overview?.posts_this_week || '0'}
          </p>
          <p className={`text-sm mt-1 ${overview && overview.posts_change >= 0 ? 'text-accent-emerald' : 'text-accent-red'}`}>
            {overview && overview.posts_change >= 0 ? '+' : ''}{overview?.posts_change || 0}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-border-subtle p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-accent-purple" />
            <span className="text-sm text-text-secondary">Leads Generated</span>
          </div>
          <p className="text-3xl font-bold text-text-primary font-mono">
            {overview?.leads_generated?.toLocaleString() || '0'}
          </p>
          <p className={`text-sm mt-1 ${overview && overview.leads_change >= 0 ? 'text-accent-emerald' : 'text-accent-red'}`}>
            {overview && overview.leads_change >= 0 ? '+' : ''}{overview?.leads_change || 0}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-border-subtle p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-4 h-4 text-accent-orange" />
            <span className="text-sm text-text-secondary">Campaigns Sent</span>
          </div>
          <p className="text-3xl font-bold text-text-primary font-mono">
            {overview?.campaigns_sent || '0'}
          </p>
          <p className={`text-sm mt-1 ${overview && overview.campaigns_change >= 0 ? 'text-accent-emerald' : 'text-accent-red'}`}>
            {overview && overview.campaigns_change >= 0 ? '+' : ''}{overview?.campaigns_change || 0}%
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-border-subtle p-6"
        >
          <h3 className="font-clash text-lg font-semibold text-text-primary mb-4">Platform Performance</h3>
          {socialStats?.platform_breakdown && socialStats.platform_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={socialStats.platform_breakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1A56DB" name="Posts" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-text-muted text-sm">
              No social media data yet
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-border-subtle p-6"
        >
          <h3 className="font-clash text-lg font-semibold text-text-primary mb-4">Campaign Performance</h3>
          {campaignStats?.by_type && campaignStats.by_type.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignStats.by_type}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8B5CF6" name="Campaigns" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-text-muted text-sm">
              No campaign data yet
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl border border-border-subtle p-6"
      >
        <h3 className="font-clash text-lg font-semibold text-text-primary mb-4">Content Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-bg-surface rounded-lg">
            <p className="text-sm text-text-secondary mb-1">Best Post Type</p>
            <p className="font-medium text-text-primary">{socialStats?.best_post_type || 'N/A'}</p>
          </div>
          <div className="p-4 bg-bg-surface rounded-lg">
            <p className="text-sm text-text-secondary mb-1">Best Day to Post</p>
            <p className="font-medium text-text-primary">{socialStats?.best_day || 'N/A'}</p>
          </div>
          <div className="p-4 bg-bg-surface rounded-lg">
            <p className="text-sm text-text-secondary mb-1">Total Opened</p>
            <p className="font-medium text-text-primary font-mono">{campaignStats?.total_opened?.toLocaleString() || '0'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
