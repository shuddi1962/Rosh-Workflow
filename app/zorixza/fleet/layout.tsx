'use client';

import { Truck } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function FleetLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Truck}
      eyebrow="Zorixza · Fleet workspace"
      title="Fleet & Transport"
      desc="Vehicles, drivers, trips, fuel and maintenance."
      tabs={[{ label: 'Overview', href: '/zorixza/fleet' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
