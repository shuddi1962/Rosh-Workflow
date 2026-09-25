'use client';

import { BarChart3 } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={BarChart3}
      eyebrow="Zorixza · Analytics workspace"
      title="Analytics"
      desc="Cross-module KPIs, trends and exports."
      tabs={[{ label: 'Overview', href: '/zorixza/analytics' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
