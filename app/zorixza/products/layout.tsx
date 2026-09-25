'use client';

import { Package } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Package}
      eyebrow="Zorixza · Products workspace"
      title="Products"
      desc="Catalogue, SKUs, categories and price lists."
      tabs={[{ label: 'Overview', href: '/zorixza/products' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
