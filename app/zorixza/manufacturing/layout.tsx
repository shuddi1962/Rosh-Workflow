'use client';

import { Factory } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function ManufacturingLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Factory}
      eyebrow="Zorixza · Manufacturing workspace"
      title="Manufacturing"
      desc="Bills of materials, work orders and production costing."
      tabs={[{ label: 'Overview', href: '/zorixza/manufacturing' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
