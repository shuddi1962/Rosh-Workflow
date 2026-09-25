'use client';

import { Target } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function BudgetsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Target}
      eyebrow="Zorixza · Budgets workspace"
      title="Budgets & Forecasts"
      desc="Plans, variance analysis and cash forecasting."
      tabs={[{ label: 'Overview', href: '/zorixza/budgets' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
