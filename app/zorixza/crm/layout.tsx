'use client';

import { Users } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Users}
      eyebrow="Zorixza · CRM workspace"
      title="Customers & Pipeline"
      desc="Leads, customers and live pipeline — one connected record."
      tabs={[
        { label: 'Dashboard', href: '/zorixza/crm' },
        { label: 'Leads', href: '/zorixza/crm/leads' },
        { label: 'Customers', href: '/zorixza/crm/customers' },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
