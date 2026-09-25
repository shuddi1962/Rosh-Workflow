'use client';

import { Archive } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Archive}
      eyebrow="Zorixza · Assets workspace"
      title="Assets"
      desc="Equipment, vehicles, tools and office assets with custody."
      tabs={[{ label: 'Overview', href: '/zorixza/assets' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
