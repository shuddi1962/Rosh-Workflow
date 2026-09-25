'use client';

import { ReceiptText } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function InvoicingLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={ReceiptText}
      eyebrow="Zorixza · Invoicing workspace"
      title="Invoicing"
      desc="Draft, send, collect and age every invoice with receipts."
      tabs={[{ label: 'Overview', href: '/zorixza/invoicing' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
