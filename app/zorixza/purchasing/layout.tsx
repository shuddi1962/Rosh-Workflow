'use client';

import { ClipboardList } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function PurchasingLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={ClipboardList}
      eyebrow="Zorixza · Purchasing workspace"
      title="Purchasing"
      desc="Suppliers, purchase orders and goods receipts — RFQ to GRN on real records."
      tabs={[
        { label: 'Overview', href: '/zorixza/purchasing' },
        { label: 'Suppliers', href: '/zorixza/purchasing/suppliers' },
        { label: 'Purchase Orders', href: '/zorixza/purchasing/orders' },
        { label: 'Goods Receipts', href: '/zorixza/purchasing/receipts' },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
