'use client';

import { LifeBuoy } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={LifeBuoy}
      eyebrow="Zorixza · Support workspace"
      title="Support"
      desc="Tickets, SLA, assignment and satisfaction."
      tabs={[{ label: 'Overview', href: '/zorixza/support' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
