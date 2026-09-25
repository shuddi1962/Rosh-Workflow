'use client';

import { UserPlus } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function RecruitmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={UserPlus}
      eyebrow="Zorixza · Recruitment workspace"
      title="Recruitment"
      desc="Requisitions, candidates, interviews, offers and analytics."
      tabs={[{ label: 'Overview', href: '/zorixza/recruitment' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
