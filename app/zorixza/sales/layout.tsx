'use client';

import { ShoppingCart } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={ShoppingCart}
      eyebrow="Zorixza · Sales workspace"
      title="Sales"
      desc="Quotations → orders → waybills → delivery → invoice."
      tabs={[{ label: 'Overview', href: '/zorixza/sales' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
