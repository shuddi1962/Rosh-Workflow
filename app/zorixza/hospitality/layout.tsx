'use client';

import { BedDouble } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function HospitalityLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={BedDouble}
      eyebrow="Zorixza · Hospitality workspace"
      title="Hospitality"
      desc="Reservations, front desk, housekeeping and billing."
      tabs={[{ label: 'Overview', href: '/zorixza/hospitality' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
