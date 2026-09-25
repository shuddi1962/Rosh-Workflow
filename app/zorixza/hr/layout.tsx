'use client';

import { HeartHandshake } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={HeartHandshake}
      eyebrow="Zorixza · HR workspace"
      title="Human Resources"
      desc="Staff directory, departments and headcount — attendance, leave and payroll ship in P14–P15."
      tabs={[
        { label: 'Overview', href: '/zorixza/hr' },
        { label: 'Staff Directory', href: '/zorixza/hr/directory' },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
