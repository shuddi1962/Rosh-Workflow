'use client';

import { Sprout } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function NgoLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Sprout}
      eyebrow="Zorixza · NGO workspace"
      title="NGO / Funds"
      desc="Grants, beneficiaries, disbursements and donor reports."
      tabs={[{ label: 'Overview', href: '/zorixza/ngo' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
