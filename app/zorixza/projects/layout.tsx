'use client';

import { Briefcase } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Briefcase}
      eyebrow="Zorixza · Projects workspace"
      title="Projects"
      desc="Projects, milestones and delivery — linked to schedules, documents and costs."
      tabs={[
        { label: 'Overview', href: '/zorixza/projects' },
        { label: 'Projects', href: '/zorixza/projects/list' },
        { label: 'Schedules', href: '/zorixza/operations/schedules' },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
