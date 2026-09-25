'use client';

import { Zap } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Zap}
      eyebrow="Zorixza · Automation workspace"
      title="Automation"
      desc="Triggers, conditions, actions, logs and failure handling."
      tabs={[{ label: 'Overview', href: '/zorixza/automation' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
