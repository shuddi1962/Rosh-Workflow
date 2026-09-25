import { FolderOpen } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={FolderOpen}
      eyebrow="Zorixza · Documents workspace"
      title="Document Control"
      desc="Custody chain plus the cloud file browser — every file tenant-isolated."
      tabs={[
        { label: 'Custody', href: '/zorixza/documents' },
        { label: 'Files', href: '/zorixza/documents/files' },
      ]}
    >
      {children}
    </WorkspaceShell>
  );
}
