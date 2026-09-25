'use client';

import { Wallet } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Wallet}
      eyebrow="Zorixza · Finance workspace"
      title="Finance"
      desc="Cash flow, budgets, fixed assets and management pack."
      tabs={[{ label: 'Overview', href: '/zorixza/finance' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
