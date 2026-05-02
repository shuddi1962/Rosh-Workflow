'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Key, Package, TrendingUp, Activity, AlertTriangle, Zap, RefreshCw } from 'lucide-react'

interface KPI {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: typeof Users
  color: string
}

interface HealthService {
  name: string
  status: string
  latency: string
}

interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  details: Record<string, unknown>
  created_at: string
}

interface ApiKeySummary {
  total: number
  active: number
  inactive: number
  tested_today: number
  services: { service: string; status: string }[]
}

export default function AdminPage() {
  const [kpis, setKpis] = useState<KPI[]>([
    { title: 'Total Users', value: '0', change: 'Loading...', trend: 'up', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { title: 'Active API Keys', value: '0', change: 'Loading...', trend: 'up', icon: Key, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Products', value: '0', change: 'Loading...', trend: 'up', icon: Package, color: 'bg-purple-50 text-purple-600' },
    { title: 'Monthly Leads', value: '0', change: 'Loading...', trend: 'up', icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
  ])
  const [health, setHealth] = useState<HealthService[]>([
    { name: 'InsForge Database', status: 'checking', latency: '...' },
    { name: 'Authentication', status: 'checking', latency: '...' },
    { name: 'API Key Vault', status: 'checking', latency: '...' },
  ])
  const [recentActions, setRecentActions] = useState<AuditLog[]>([])
  const [apiKeySummary, setApiKeySummary] = useState<ApiKeySummary>({ total: 0, active: 0, inactive: 0, tested_today: 0, services: [] })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [overviewRes, healthRes, logsRes, usersRes, productsRes, leadsRes, apiKeysRes] = await Promise.all([
        fetch('/api/admin/analytics/overview', { headers }),
        fetch('/api/admin/system/health', { headers }),
        fetch('/api/admin/audit-logs?limit=5', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/products', { headers }),
        fetch('/api/leads/stats', { headers }),
        fetch('/api/admin/api-keys', { headers }),
      ])

      const overview = overviewRes.ok ? await overviewRes.json() : null
      const usersData = usersRes.ok ? await usersRes.json() : { users: [] }
      const productsData = productsRes.ok ? await productsRes.json() : { products: [] }
      const leadsData = leadsRes.ok ? await leadsRes.json() : { total: 0 }
      const logsData = logsRes.ok ? await logsRes.json() : []
      const apiKeysData = apiKeysRes.ok ? await apiKeysRes.json() : { keys: [] }

      const keys = apiKeysData.keys || []
      const today = new Date().toDateString()
      const activeKeys = keys.filter((k: Record<string, unknown>) => k.is_active === true)
      const testedToday = keys.filter((k: Record<string, unknown>) => k.last_tested && new Date(k.last_tested as string).toDateString() === today)

      const serviceStatuses = keys.map((k: Record<string, unknown>) => ({
        service: k.service as string,
        status: k.last_test_result as string || 'untested'
      }))

      setApiKeySummary({
        total: keys.length,
        active: activeKeys.length,
        inactive: keys.length - activeKeys.length,
        tested_today: testedToday.length,
        services: serviceStatuses
      })

      setKpis([
        { title: 'Total Users', value: String(usersData.users?.length || 0), change: 'Active accounts', trend: 'up', icon: Users, color: 'bg-blue-50 text-blue-600' },
        { title: 'Active API Keys', value: String(activeKeys.length), change: `${keys.length} total • ${testedToday.length} tested today`, trend: activeKeys.length > 0 ? 'up' : 'down', icon: Key, color: activeKeys.length > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600' },
        { title: 'Products', value: String(productsData.products?.length || 0), change: 'In catalog', trend: 'up', icon: Package, color: 'bg-purple-50 text-purple-600' },
        { title: 'Monthly Leads', value: String(leadsData.total || 0), change: 'This month', trend: 'up', icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
      ])

      setHealth(healthRes.ok ? await healthRes.json() : [])

      setRecentActions(logsData.slice(0, 5) || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  if (loading) return <div className="p-6 text-gray-600">Loading dashboard...</div>

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-clash text-3xl font-bold text-gray-900 mb-2">Admin Overview</h1>
          <p className="text-gray-600">System health, user activity, and platform metrics.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${kpi.color} rounded-lg flex items-center justify-center`}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {kpi.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
            <div className="text-gray-500 text-sm">{kpi.title}</div>
          </div>
        ))}
      </div>

      {apiKeySummary.total > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-clash text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              API Key Status
            </h2>
            <a href="/admin/api-keys" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Manage Keys →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{apiKeySummary.total}</p>
              <p className="text-xs text-gray-500 mt-1">Total Keys</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{apiKeySummary.active}</p>
              <p className="text-xs text-green-600 mt-1">Active</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-500">{apiKeySummary.inactive}</p>
              <p className="text-xs text-gray-500 mt-1">Inactive</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{apiKeySummary.tested_today}</p>
              <p className="text-xs text-blue-600 mt-1">Tested Today</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {apiKeySummary.services.map((svc, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  svc.status?.startsWith('success') ? 'bg-green-500' :
                  svc.status === 'untested' ? 'bg-gray-400' : 'bg-red-500'
                }`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{svc.service}</p>
                  <p className="text-xs text-gray-500 truncate">{svc.status || 'untested'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-clash text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" />
              System Health
            </h2>
          </div>
          <div className="space-y-3">
            {health.length > 0 ? health.map((service, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${service.status === 'healthy' || service.status === 'up' ? 'bg-emerald-500' : service.status === 'warning' || service.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="text-gray-900 font-medium text-sm">{service.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm">{service.latency || 'N/A'}</span>
                  {service.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm text-center py-4">No health data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-clash text-xl font-semibold text-gray-900">Recent Admin Actions</h2>
          </div>
          <div className="space-y-4">
            {recentActions.length > 0 ? recentActions.map((action) => (
              <div key={action.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-bold">{(action.user_id || 'A').charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm font-medium">{action.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-500 text-xs">{action.entity_type}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 text-xs">{new Date(action.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm text-center py-4">No recent actions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
