'use client';

import { CreditCard } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={CreditCard}
      eyebrow="Zorixza · Billing workspace"
      title="Billing"
      desc="Zorixza plans, subscriptions, storage quotas and invoices."
      tabs={[{ label: 'Overview', href: '/zorixza/billing' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
