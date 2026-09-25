'use client';

import { Globe } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function PortalsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Globe}
      eyebrow="Zorixza · Portals workspace"
      title="Portals"
      desc="Customer, vendor, employee and partner self-service access."
      tabs={[{ label: 'Overview', href: '/zorixza/portals' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
