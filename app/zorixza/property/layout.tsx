'use client';

import { Building } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Building}
      eyebrow="Zorixza · Property workspace"
      title="Property"
      desc="Units, tenants, leases, rent and maintenance."
      tabs={[{ label: 'Overview', href: '/zorixza/property' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
