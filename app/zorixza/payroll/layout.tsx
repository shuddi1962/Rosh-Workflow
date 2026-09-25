'use client';

import { Banknote } from 'lucide-react';
import { WorkspaceShell } from '@/components/zorixza/WorkspaceShell';

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceShell
      icon={Banknote}
      eyebrow="Zorixza · Payroll workspace"
      title="Payroll"
      desc="Salaries, allowances, deductions, tax, pension and payslips."
      tabs={[{ label: 'Overview', href: '/zorixza/payroll' }]}
    >
      {children}
    </WorkspaceShell>
  );
}
