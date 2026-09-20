'use client'

import { TenantProvider } from '@/lib/context/TenantContext'
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
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTenant } from '@/lib/context/TenantContext'

function DashboardContent() {
  const { currentTenant } = useTenant()

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2"
      >
        <h1 className="font-clash text-3xl font-bold text-text-primary mb-1">
          Welcome back, {currentTenant.ownerName}
        </h1>
        <p className="text-text-secondary text-sm">
          {currentTenant.name} · {currentTenant.industry} · {currentTenant.plan} Plan
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <MetricCards />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AiCommandCenter />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <ActiveAutomationsPanel />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <RevenueOverviewChart />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <LeadsBySourceChart />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <RecentActivityList />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <TopCampaignsTable />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <SalesPipelineCard />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <AudienceDemographics />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <QuickToolsGrid />
      </motion.div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <TenantProvider>
      <DashboardContent />
    </TenantProvider>
  )
}
