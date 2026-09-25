'use client';

import { Plug } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Plug}
      eyebrow="Zorixza · Integrations workspace"
      title="Integrations"
      desc="Providers, credentials, health, sync logs and mapping."
      tabs={[{ label: 'Overview', href: '/zorixza/integrations' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
