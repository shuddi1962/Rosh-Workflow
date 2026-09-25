'use client';

import { Warehouse } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Warehouse}
      eyebrow="Zorixza · Inventory workspace"
      title="Stock & Warehouses"
      desc="Balances derive from auditable movements — never edited silently."
      tabs={[
        { label: 'Dashboard', href: '/zorixza/inventory' },
        { label: 'Stock', href: '/zorixza/inventory/stock' },
        { label: 'Warehouses', href: '/zorixza/inventory/warehouses' },
        { label: 'Movements', href: '/zorixza/inventory/movements' },
        { label: 'Transfers', href: '/zorixza/inventory/transfers' },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
