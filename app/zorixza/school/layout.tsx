'use client';

import { GraduationCap } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={GraduationCap}
      eyebrow="Zorixza · School workspace"
      title="School Module"
      desc="Students, fees, classes, attendance and results."
      tabs={[{ label: 'Overview', href: '/zorixza/school' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
