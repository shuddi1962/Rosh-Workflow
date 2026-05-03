'use client'

import { Target, TrendingUp, Star, Users, Crown, RefreshCw, AlertTriangle, UserPlus, Building2, Wrench } from 'lucide-react'
import { motion } from 'framer-motion'

interface CRMKPICardsProps {
  totalLeads: number
  conversionRate: number
  pipelineValue: number
  avgLeadScore: number
  totalLeadsChange?: number
  conversionChange?: number
  pipelineChange?: number
  scoreChange?: number
}

const iconMap = [Target, TrendingUp, Star, Users]
const labels = ['Total Leads', 'Conversion Rate', 'Pipeline Value', 'Avg Lead Score']
const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50']
const iconColors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600']

export function CRMKPICards({ totalLeads, conversionRate, pipelineValue, avgLeadScore, totalLeadsChange, conversionChange, pipelineChange, scoreChange }: CRMKPICardsProps) {
  const values = [
    totalLeads,
    `${conversionRate}%`,
    `₦${pipelineValue >= 1 ? `${(pipelineValue / 1000000).toFixed(1)}M` : pipelineValue.toLocaleString()}`,
    avgLeadScore,
  ]
  const changes = [totalLeadsChange, conversionChange, pipelineChange, scoreChange]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {values.map((value, i) => {
        const Icon = iconMap[i]
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg ${bgColors[i]} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${iconColors[i]}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 font-mono">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{labels[i]}</p>
            {changes[i] !== undefined && (
              <p className={`text-xs mt-1 font-medium ${changes[i]! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {changes[i]! >= 0 ? '+' : ''}{changes[i]}% this week
              </p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
