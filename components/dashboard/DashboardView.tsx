'use client';

import React from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MetricCards } from './MetricCards';
import { ActiveAutomationsPanel } from './ActiveAutomationsPanel';
import { RevenueOverviewChart } from './RevenueOverviewChart';
import { LeadsBySourceChart } from './LeadsBySourceChart';
import { RecentActivityList } from './RecentActivityList';
import { TopCampaignsTable } from './TopCampaignsTable';
import { AudienceDemographics } from './AudienceDemographics';
import { SalesPipelineCard } from './SalesPipelineCard';
import { QuickToolsGrid } from './QuickToolsGrid';
import { AiCommandCenter } from './AiCommandCenter';

export const DashboardView: React.FC = () => (
  <div className="min-h-screen bg-slate-50">
    <DashboardSidebar />
    <div className="ml-64">
      <DashboardHeader />
      <main className="p-6 space-y-6">
        <MetricCards />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AiCommandCenter />
          <ActiveAutomationsPanel />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueOverviewChart />
          </div>
          <div>
            <LeadsBySourceChart />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivityList />
          <TopCampaignsTable />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesPipelineCard />
          <AudienceDemographics />
        </div>
        <QuickToolsGrid />
      </main>
    </div>
  </div>
);
