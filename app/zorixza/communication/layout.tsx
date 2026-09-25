'use client';

import { Map } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function CommunicationLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Map}
      eyebrow="Zorixza · Communication workspace"
      title="Communication"
      desc="Unified email, SMS, notifications, templates and delivery history."
      tabs={[{ label: 'Overview', href: '/zorixza/communication' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
