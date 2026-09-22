'use client'

import { useRouter } from 'next/navigation'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { AiCommandCenter } from '@/components/dashboard/AiCommandCenter'
import { ActiveAutomationsPanel } from '@/components/dashboard/ActiveAutomationsPanel'
import { RevenueOverviewChart } from '@/components/dashboard/RevenueOverviewChart'
import { LeadsBySourceChart } from '@/components/dashboard/LeadsBySourceChart'
import { RecentActivityList } from '@/components/dashboard/RecentActivityList'
import { TopCampaignsTable } from '@/components/dashboard/TopCampaignsTable'
import { AudienceDemographics } from '@/components/dashboard/AudienceDemographics'
import { SalesPipelineCard } from '@/components/dashboard/SalesPipelineCard'
import { QuickToolsGrid } from '@/components/dashboard/QuickToolsGrid'
import { useTenant } from '@/lib/context/TenantContext'
import { motion } from 'framer-motion'
import { Rocket, Users, Target, PenLine, ArrowRight } from 'lucide-react'

function DashboardContent() {
  const { currentTenant } = useTenant()
  const router = useRouter()

  const quickActions = [
    { icon: Rocket, label: 'Create Campaign', color: '#1468F5', bg: 'bg-[#1468F5]', href: '/dashboard/campaigns/create' },
    { icon: Users, label: 'Find Leads', color: '#10B981', bg: 'bg-[#10B981]', href: '/dashboard/crm/leads' },
    { icon: Target, label: 'Analyze Competitors', color: '#EF233C', bg: 'bg-[#EF233C]', href: '/dashboard/competitors' },
    { icon: PenLine, label: 'Create Content', color: '#1468F5', bg: 'bg-[#1468F5]', href: '/dashboard/content' },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 mb-1">Good morning, {currentTenant.ownerName} 👋</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Your business, powered by <span className="text-[#EF233C]">AI.</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Everything you need to market, sell, and grow — all in one intelligent platform.</p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => router.push(a.href)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white ${a.bg} hover:opacity-90 transition shadow-sm`}
            >
              <a.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{a.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AiCommandCenter />
          </div>
          <ActiveAutomationsPanel />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <MetricCards />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueOverviewChart />
        </div>
        <LeadsBySourceChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivityList />
        <div className="lg:col-span-2">
          <TopCampaignsTable />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AudienceDemographics />
        <SalesPipelineCard />
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <QuickToolsGrid />
      </motion.div>
    </div>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}