'use client';

import { HardHat } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function InstallationLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={HardHat}
      eyebrow="Zorixza · Installation workspace"
      title="Installation"
      desc="CCTV, access, marine and ICT install teams and jobs."
      tabs={[{ label: 'Overview', href: '/zorixza/installation' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
