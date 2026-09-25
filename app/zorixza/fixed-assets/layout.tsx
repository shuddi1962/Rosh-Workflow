'use client';

import { Boxes } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function FixedAssetsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Boxes}
      eyebrow="Zorixza · Fixed Assets workspace"
      title="Fixed Assets"
      desc="Register, depreciation, transfers and disposal."
      tabs={[{ label: 'Overview', href: '/zorixza/fixed-assets' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
