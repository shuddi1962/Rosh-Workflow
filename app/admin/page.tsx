'use client'

import { motion } from 'framer-motion'
import {
  Users,
  Key,
  Package,
  TrendingUp,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

const adminKpis = [
  {
    title: 'Total Users',
    value: '8',
    change: '+2 this month',
    trend: 'up' as const,
    icon: Users,
    color: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'Active API Keys',
    value: '12',
    change: 'All healthy',
    trend: 'up' as const,
    icon: Key,
    color: 'bg-emerald-50 text-emerald-600'
  },
  {
    title: 'Products',
    value: '47',
    change: '+5 new',
    trend: 'up' as const,
    icon: Package,
    color: 'bg-purple-50 text-purple-600'
  },
  {
    title: 'Monthly Leads',
    value: '324',
    change: '+18.2%',
    trend: 'up' as const,
    icon: TrendingUp,
    color: 'bg-amber-50 text-amber-600'
  }
]

const systemHealth = [
  { service: 'InsForge Database', status: 'healthy', latency: '45ms' },
  { service: 'Authentication', status: 'healthy', latency: '32ms' },
  { service: 'API Key Vault', status: 'healthy', latency: '28ms' },
  { service: 'Content Generation', status: 'healthy', latency: '120ms' },
  { service: 'Social Publishing', status: 'warning', latency: '250ms' }
]

const recentActions = [
  {
    user: 'Demo User',
    action: 'Created new product: Suzuki DF100HTX',
    time: '5 minutes ago',
    type: 'product'
  },
  {
    user: 'Admin',
    action: 'Updated API key: Anthropic Claude',
    time: '1 hour ago',
    type: 'api'
  },
  {
    user: 'Demo User',
    action: 'Generated 15 content pieces for Marine division',
    time: '2 hours ago',
    type: 'content'
  },
  {
    user: 'Admin',
    action: 'Added new team member: marketing@roshanal.com',
    time: '3 hours ago',
    type: 'user'
  }
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="font-clash text-3xl font-bold text-gray-900 mb-2">
            Admin Overview
          </h1>
          <p className="text-gray-600">
            System health, user activity, and platform metrics.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {adminKpis.map((kpi, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${kpi.color} rounded-lg flex items-center justify-center`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {kpi.change}
                </div>
              </div>
              <div className="font-jetbrains text-2xl font-bold text-gray-900 mb-1">
                {kpi.value}
              </div>
              <div className="text-gray-500 text-sm">{kpi.title}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-clash text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                System Health
              </h2>
            </div>
            <div className="space-y-3">
              {systemHealth.map((service, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      service.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-gray-900 font-medium text-sm">{service.service}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm font-jetbrains">{service.latency}</span>
                    {service.status === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-clash text-xl font-semibold text-gray-900">
                Recent Admin Actions
              </h2>
            </div>
            <div className="space-y-4">
              {recentActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-xs font-bold">
                      {action.user.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm font-medium">{action.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 text-xs">{action.user}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500 text-xs">{action.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
