'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
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
import { PageHeader } from '@/components/dashboard/PageHeader'

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

interface OverviewResponse {
  total_reach?: number
  posts_this_week?: number
  leads_generated?: number
  campaigns_sent?: number
  total_posts?: number
  published_posts?: number
  total_leads?: number
  hot_leads?: number
  total_campaigns?: number
  active_campaigns?: number
  overview?: OverviewResponse
  reach_change?: number
  posts_change?: number
  leads_change?: number
  campaigns_change?: number
}

interface SocialResponse {
  platform_breakdown?: Record<string, { total: number; published: number; engagement: number }> | Array<{ platform: string; count: number }>
  top_posts?: Array<Record<string, unknown>>
  total_posts?: number
  stats?: SocialResponse
  best_post_type?: string
  best_day?: string
}

interface CampaignsResponse {
  campaigns?: Array<Record<string, unknown>>
  by_type?: Record<string, number> | Array<{ type: string; count: number }>
  by_status?: Record<string, number>
  by_division?: Record<string, number>
  total_sent?: number
  total_opened?: number
  total_clicked?: number
  stats?: CampaignsResponse
}

function normalizeOverview(data: OverviewResponse): Overview {
  const src = data.overview ?? data
  return {
    total_reach: src.total_reach ?? src.published_posts ?? src.total_posts ?? 0,
    posts_this_week: src.posts_this_week ?? src.total_posts ?? 0,
    leads_generated: src.leads_generated ?? src.total_leads ?? 0,
    campaigns_sent: src.campaigns_sent ?? src.total_campaigns ?? 0,
    reach_change: src.reach_change ?? 0,
    posts_change: src.posts_change ?? 0,
    leads_change: src.leads_change ?? 0,
    campaigns_change: src.campaigns_change ?? 0,
  }
}

function normalizeSocial(data: SocialResponse): SocialStats {
  const src = data.stats ?? data
  const breakdown = src.platform_breakdown
  const platform_breakdown = Array.isArray(breakdown)
    ? breakdown
    : Object.entries(breakdown ?? {}).map(([platform, v]) => ({ platform, count: v.total }))
  const top_posts = (src.top_posts ?? []).slice(0, 5).map((p, i) => ({
    id: String(p.id ?? i),
    caption: String(p.caption ?? p.content ?? 'Untitled post'),
    engagement: typeof p.total_engagement === 'number' ? p.total_engagement : 0,
  }))
  return {
    platform_breakdown,
    top_posts,
    best_post_type: src.best_post_type ?? 'N/A',
    best_day: src.best_day ?? 'N/A',
  }
}

function normalizeCampaigns(data: CampaignsResponse): CampaignStats {
  const src = data.stats ?? data
  const byType = src.by_type
  const by_type = Array.isArray(byType)
    ? byType
    : Object.entries(byType ?? {}).map(([type, count]) => ({ type, count }))
  const campaigns = src.campaigns ?? []
  return {
    total_sent: src.total_sent ?? campaigns.length,
    total_opened: src.total_opened ?? 0,
    total_clicked: src.total_clicked ?? 0,
    by_type,
  }
}

export default function DashboardAnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [socialStats, setSocialStats] = useState<SocialStats | null>(null)
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAll = async (): Promise<void> => {
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
          const data = await overviewRes.json() as OverviewResponse
          setOverview(normalizeOverview(data))
        }

        if (socialRes.ok) {
          const data = await socialRes.json() as SocialResponse
          setSocialStats(normalizeSocial(data))
        }

        if (campaignsRes.ok) {
          const data = await campaignsRes.json() as CampaignsResponse
          setCampaignStats(normalizeCampaigns(data))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    void fetchAll()
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
      <PageHeader
        eyebrow="Insights"
        title="Analytics Dashboard"
        description="Reach, engagement, leads and revenue — see exactly what is working."
        icon={BarChart3}
        actions={
          <>
            <Link
              href="/dashboard/campaigns"
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 text-sm font-medium"
            >
              View Campaigns
            </Link>
            <Link
              href="/dashboard/content"
              className="px-4 py-2 border border-border-subtle rounded-lg text-sm text-text-primary hover:bg-bg-surface"
            >
              View Content
            </Link>
          </>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm mb-6">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <p className={`text-sm mt-1 ${overview && overview.reach_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-text-secondary">Posts This Week</span>
          </div>
          <p className="text-3xl font-bold text-text-primary font-mono">
            {overview?.posts_this_week || '0'}
          </p>
          <p className={`text-sm mt-1 ${overview && overview.posts_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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
            <Users className="w-4 h-4 text-accent-primary" />
            <span className="text-sm text-text-secondary">Leads Generated</span>
          </div>
          <p className="text-3xl font-bold text-text-primary font-mono">
            {overview?.leads_generated?.toLocaleString() || '0'}
          </p>
          <p className={`text-sm mt-1 ${overview && overview.leads_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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
            <Megaphone className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-text-secondary">Campaigns Sent</span>
          </div>
          <p className="text-3xl font-bold text-text-primary font-mono">
            {overview?.campaigns_sent || '0'}
          </p>
          <p className={`text-sm mt-1 ${overview && overview.campaigns_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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
          <h3 className="text-lg font-semibold text-text-primary mb-4">Platform Performance</h3>
          {socialStats?.platform_breakdown && socialStats.platform_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={socialStats.platform_breakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1468F5" name="Posts" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-text-muted text-sm gap-3">
              <p>No social media data yet</p>
              <Link href="/dashboard/social" className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium hover:bg-accent-primary/90">
                Go to Social Scheduler
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-border-subtle p-6"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4">Campaign Performance</h3>
          {campaignStats?.by_type && campaignStats.by_type.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignStats.by_type}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1468F5" name="Campaigns" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-text-muted text-sm gap-3">
              <p>No campaign data yet</p>
              <Link href="/dashboard/campaigns" className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium hover:bg-accent-primary/90">
                Create a Campaign
              </Link>
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
        <h3 className="text-lg font-semibold text-text-primary mb-4">Content Insights</h3>
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
        {socialStats && socialStats.top_posts.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-text-muted border-b border-border-subtle">
                  <th className="py-2 pr-4 font-medium">Top Post</th>
                  <th className="py-2 font-medium text-right">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {socialStats.top_posts.map(post => (
                  <tr key={post.id} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 pr-4 text-text-primary truncate max-w-[320px]">{post.caption}</td>
                    <td className="py-2 text-right font-mono text-text-primary">{post.engagement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

    </div>
  )
}
