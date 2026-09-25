'use client';

import { ClipboardList } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={ClipboardList}
      eyebrow="Zorixza · Operations workspace"
      title="Daily Operations"
      desc="Schedules, approvals and alerts — the universal approval inbox lives here."
      tabs={[
        { label: 'Dashboard', href: '/zorixza/operations' },
        { label: 'Schedules', href: '/zorixza/operations/schedules' },
        { label: 'Approvals', href: '/zorixza/operations/approvals' },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
