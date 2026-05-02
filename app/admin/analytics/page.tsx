'use client'

import { useState, useEffect } from 'react'

interface Overview {
  total_reach: number
  total_posts: number
  total_leads: number
  total_campaigns: number
  ai_cost_usd: number
  engagement_rate: number
  platform_breakdown?: Record<string, number>
  top_posts?: Array<{ caption?: string; engagement?: unknown }>
}

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [socialStats, setSocialStats] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [overviewRes, socialRes] = await Promise.all([
        fetch('/api/admin/analytics/overview', { headers }),
        fetch('/api/analytics/social', { headers }),
      ])
      if (overviewRes.ok) setOverview(await overviewRes.json())
      if (socialRes.ok) setSocialStats(await socialRes.json())
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6 text-gray-600">Loading analytics...</div>

  if (!overview) return <div className="p-6 text-gray-600">No analytics data available</div>

  const stats = [
    { label: 'Total Reach', value: overview.total_reach?.toLocaleString() || '0', change: '+0%' },
    { label: 'Posts Published', value: overview.total_posts?.toLocaleString() || '0', change: '+0%' },
    { label: 'Leads Generated', value: overview.total_leads?.toLocaleString() || '0', change: '+0%' },
    { label: 'Campaigns Sent', value: overview.total_campaigns?.toLocaleString() || '0', change: '+0%' },
    { label: 'AI Cost', value: `$${(overview.ai_cost_usd || 0).toFixed(2)}`, change: 'This month' },
    { label: 'Engagement Rate', value: `${overview.engagement_rate || 0}%`, change: 'Average' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-gray-900 mb-8">Analytics Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 font-mono">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
          {overview.platform_breakdown ? (
            <div className="space-y-3">
              {Object.entries(overview.platform_breakdown).map(([platform, count]) => (
                <div key={platform} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{platform}</span>
                  <span className="font-mono text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No platform data available</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Performing Content</h3>
          {overview.top_posts && overview.top_posts.length > 0 ? (
            <div className="space-y-3">
              {overview.top_posts.map((post, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 text-sm font-medium truncate">{post.caption?.substring(0, 80) || 'Untitled'}...</p>
                  <p className="text-gray-500 text-xs mt-1">Engagement: {JSON.stringify(post.engagement)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No top posts data available</p>
          )}
        </div>
      </div>
    </div>
  )
}
