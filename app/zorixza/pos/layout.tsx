'use client';

import { ShoppingBag } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={ShoppingBag}
      eyebrow="Zorixza · Point of Sale workspace"
      title="Point of Sale"
      desc="Counter sales with barcode scan, cash drawer and receipts."
      tabs={[{ label: 'Overview', href: '/zorixza/pos' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
