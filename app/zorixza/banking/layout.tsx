'use client';

import { Landmark } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function BankingLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Landmark}
      eyebrow="Zorixza · Banking workspace"
      title="Banking & Feeds"
      desc="Accounts, imports, matching and reconciliation."
      tabs={[{ label: 'Overview', href: '/zorixza/banking' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
