'use client';

import { PiggyBank } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function LoansLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={PiggyBank}
      eyebrow="Zorixza · Loans workspace"
      title="Loans"
      desc="Borrowings, schedules, repayments and interest."
      tabs={[{ label: 'Overview', href: '/zorixza/loans' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
