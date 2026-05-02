'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  FileText,
  Users,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  Loader2
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface KPI {
  total_reach: number
  posts_this_week: number
  leads_this_month: number
  campaigns_sent: number
  reach_change: number
  posts_change: number
  leads_change: number
  campaigns_change: number
}

interface DailyStat {
  date: string
  reach: number
  posts: number
  leads: number
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<KPI | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('accessToken')
        const res = await fetch('/api/analytics/overview', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const data = await res.json()
        setKpi(data.kpi || data)
        setDailyStats(data.daily_stats || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
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
        <h1 className="font-clash text-3xl font-bold text-gray-900 mb-2">
          Good morning, {localStorage.getItem('userName') || 'User'}
        </h1>
        <p className="text-gray-600">
          Here is what is happening with your marketing today.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${kpi && kpi.reach_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {kpi && kpi.reach_change >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {kpi ? `${kpi.reach_change >= 0 ? '+' : ''}${kpi.reach_change}%` : '+0%'}
            </div>
          </div>
          <div className="font-jetbrains text-2xl font-bold text-gray-900 mb-1">
            {kpi?.total_reach?.toLocaleString() || '0'}
          </div>
          <div className="text-gray-500 text-sm">Total Reach</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${kpi && kpi.posts_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {kpi && kpi.posts_change >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {kpi ? `${kpi.posts_change >= 0 ? '+' : ''}${kpi.posts_change}%` : '+0%'}
            </div>
          </div>
          <div className="font-jetbrains text-2xl font-bold text-gray-900 mb-1">
            {kpi?.posts_this_week || '0'}
          </div>
          <div className="text-gray-500 text-sm">Posts This Week</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${kpi && kpi.leads_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {kpi && kpi.leads_change >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {kpi ? `${kpi.leads_change >= 0 ? '+' : ''}${kpi.leads_change}%` : '+0%'}
            </div>
          </div>
          <div className="font-jetbrains text-2xl font-bold text-gray-900 mb-1">
            {kpi?.leads_this_month?.toLocaleString() || '0'}
          </div>
          <div className="text-gray-500 text-sm">Leads This Month</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${kpi && kpi.campaigns_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {kpi && kpi.campaigns_change >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {kpi ? `${kpi.campaigns_change >= 0 ? '+' : ''}${kpi.campaigns_change}%` : '+0%'}
            </div>
          </div>
          <div className="font-jetbrains text-2xl font-bold text-gray-900 mb-1">
            {kpi?.campaigns_sent || '0'}
          </div>
          <div className="text-gray-500 text-sm">Campaigns Sent</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
      >
        <h2 className="font-clash text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          Daily Performance
        </h2>
        {dailyStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="reach" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} name="Reach" />
              <Area type="monotone" dataKey="leads" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} name="Leads" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
            No performance data yet
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-clash text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-gray-500 text-sm text-center py-8">
            Activity data will appear here as you use the platform
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-clash text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            Upcoming Posts
          </h2>
          <div className="text-gray-500 text-sm text-center py-8">
            No scheduled posts yet
          </div>
        </div>
      </motion.div>
    </div>
  )
}
