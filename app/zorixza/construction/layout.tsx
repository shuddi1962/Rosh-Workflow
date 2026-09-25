'use client';

import { Building2 } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function ConstructionLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Building2}
      eyebrow="Zorixza · Construction workspace"
      title="Construction"
      desc="BoQs, site progress, valuations and subcontractors."
      tabs={[{ label: 'Overview', href: '/zorixza/construction' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
