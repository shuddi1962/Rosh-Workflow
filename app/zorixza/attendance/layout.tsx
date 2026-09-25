'use client';

import { CalendarCheck } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function AttendanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={CalendarCheck}
      eyebrow="Zorixza · Attendance workspace"
      title="Attendance & Leave"
      desc="Shifts, device events, leave balances and approvals."
      tabs={[{ label: 'Overview', href: '/zorixza/attendance' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
