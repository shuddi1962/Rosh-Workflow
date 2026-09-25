'use client';

import { ListTodo } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={ListTodo}
      eyebrow="Zorixza · Tasks workspace"
      title="Tasks & Calendar"
      desc="Universal tasks, team calendar and deadline tracking."
      tabs={[{ label: 'Overview', href: '/zorixza/tasks' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
