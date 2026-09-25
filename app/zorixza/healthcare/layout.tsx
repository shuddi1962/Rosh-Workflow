'use client';

import { HeartPulse } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function HealthcareLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={HeartPulse}
      eyebrow="Zorixza · Healthcare workspace"
      title="Healthcare"
      desc="Patients, visits, billing, pharmacy and lab."
      tabs={[{ label: 'Overview', href: '/zorixza/healthcare' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
