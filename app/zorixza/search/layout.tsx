'use client';

import { Search } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Search}
      eyebrow="Zorixza · Search workspace"
      title="Global Search"
      desc="Search customers, products, invoices, documents, jobs and people."
      tabs={[{ label: 'Overview', href: '/zorixza/search' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
