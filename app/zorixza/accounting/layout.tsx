'use client';

import { Calculator } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Calculator}
      eyebrow="Zorixza · Accounting workspace"
      title="Accounting"
      desc="Chart of accounts, ledger, journals, AR/AP, banking, close."
      tabs={[{ label: 'Overview', href: '/zorixza/accounting' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
