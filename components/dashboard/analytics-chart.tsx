'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#1A56DB', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6']

export default function AnalyticsChart() {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data.analytics || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])
  
  if (loading) return <div className="text-text-muted">Loading analytics...</div>
  if (analytics.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Reach', value: '0', change: '+0%' },
            { label: 'Posts This Week', value: '0', change: '+0%' },
            { label: 'Leads Generated', value: '0', change: '+0%' },
            { label: 'Campaigns Sent', value: '0', change: '+0%' }
          ].map((stat, i) => (
            <Card key={i} className="bg-bg-surface border-border-subtle">
              <CardHeader>
                <CardTitle className="text-text-muted text-sm">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-jetbrains text-text-primary">{stat.value}</p>
                <p className="text-status-live text-xs mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-bg-surface border-border-subtle">
            <CardHeader>
              <CardTitle className="text-text-primary">Platform Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-muted text-sm">No data yet. Start posting to see analytics.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-bg-surface border-border-subtle">
            <CardHeader>
              <CardTitle className="text-text-primary">Posts Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-muted text-sm">No data yet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  const chartData = analytics.map(a => ({
    date: new Date(a.date).toLocaleDateString(),
    posts: a.posts_published,
    reach: a.total_reach,
    leads: a.leads_generated
  }))
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Reach', value: analytics.reduce((sum, a) => sum + (a.total_reach || 0), 0).toString(), change: '+12%' },
          { label: 'Posts Published', value: analytics.reduce((sum, a) => sum + (a.posts_published || 0), 0).toString(), change: '+8%' },
          { label: 'Leads Generated', value: analytics.reduce((sum, a) => sum + (a.leads_generated || 0), 0).toString(), change: '+15%' },
          { label: 'AI Cost (₦)', value: analytics.reduce((sum, a) => sum + (a.ai_cost_usd || 0), 0).toFixed(2), change: '+5%' }
        ].map((stat, i) => (
          <Card key={i} className="bg-bg-surface border-border-subtle">
            <CardHeader>
              <CardTitle className="text-text-muted text-sm">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-jetbrains text-text-primary">{stat.value}</p>
              <p className="text-status-live text-xs mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-bg-surface border-border-subtle">
          <CardHeader>
            <CardTitle className="text-text-primary">Posts & Reach Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#8B9CC8" />
                <YAxis stroke="#8B9CC8" />
                <Tooltip />
                <Line type="monotone" dataKey="posts" stroke="#1A56DB" name="Posts" />
                <Line type="monotone" dataKey="reach" stroke="#3B82F6" name="Reach" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="bg-bg-surface border-border-subtle">
          <CardHeader>
            <CardTitle className="text-text-primary">Platform Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { platform: 'Instagram', posts: 12 },
                { platform: 'Facebook', posts: 8 },
                { platform: 'WhatsApp', posts: 15 },
                { platform: 'LinkedIn', posts: 5 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="platform" stroke="#8B9CC8" />
                <YAxis stroke="#8B9CC8" />
                <Tooltip />
                <Bar dataKey="posts" fill="#1A56DB" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
