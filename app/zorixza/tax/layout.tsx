'use client';

import { FileText } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function TaxLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={FileText}
      eyebrow="Zorixza · Tax workspace"
      title="Tax & E-Filing"
      desc="Jurisdiction-configured tax computation and returns."
      tabs={[{ label: 'Overview', href: '/zorixza/tax' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
