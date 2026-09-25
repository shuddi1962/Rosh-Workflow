'use client';

import { ScanSearch } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function AuditIQLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={ScanSearch}
      eyebrow="Zorixza · AuditIQ workspace"
      title="AuditIQ"
      desc="Engagements, working papers, tests, findings and sign-off."
      tabs={[{ label: 'Overview', href: '/zorixza/auditiq' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
