'use client';

import { Gauge } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function MileageLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Gauge}
      eyebrow="Zorixza · Mileage workspace"
      title="Mileage Tracking"
      desc="Staff travel log with approval and reimbursement."
      tabs={[{ label: 'Overview', href: '/zorixza/mileage' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
