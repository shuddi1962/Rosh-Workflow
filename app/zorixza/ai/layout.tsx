'use client';

import { Bot } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function AILayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Bot}
      eyebrow="Zorixza · AI workspace"
      title="AI Assistant"
      desc="Ask questions, run commands, draft reports — permission-aware."
      tabs={[{ label: 'Overview', href: '/zorixza/ai' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
