'use client';

import { Bell } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Bell}
      eyebrow="Zorixza · Notifications workspace"
      title="Notifications"
      desc="One inbox for approvals, payments, stock, tasks and security alerts."
      tabs={[{ label: 'Overview', href: '/zorixza/notifications' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
