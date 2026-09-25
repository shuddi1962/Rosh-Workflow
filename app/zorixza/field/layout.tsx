'use client';

import { Wrench } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Wrench}
      eyebrow="Zorixza · Field Service workspace"
      title="Field Service"
      desc="Jobs, dispatch and schedules — every visit a real record with owner and date."
      tabs={[
        { label: 'Overview', href: '/zorixza/field' },
        { label: 'Jobs', href: '/zorixza/field/jobs' },
        { label: 'Schedules', href: '/zorixza/field/schedules' },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
