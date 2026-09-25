'use client';

import { Coins } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Coins}
      eyebrow="Zorixza · Expenses workspace"
      title="Expenses"
      desc="Staff claims and overheads with approval and posting."
      tabs={[{ label: 'Overview', href: '/zorixza/expenses' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
