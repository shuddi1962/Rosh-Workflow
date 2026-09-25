'use client';

import React from 'react';
import { useZxQuery, asArray, ZxTable, ZxBadge, type ZxColumn } from '@/components/zorixza/data';
import { ZxSection, ZxLoading, ZxError } from '@/components/zorixza/ui';

interface StaffRow extends Record<string, unknown> {
  id: string; full_name: string; email: string; role: string;
  department: string | null; staff_role: string | null; created_at: string;
}

const COLUMNS: ZxColumn<StaffRow>[] = [
  { key: 'full_name', label: 'Staff', render: (r) => (
    <span><span className="font-semibold text-slate-800">{String(r.full_name || '—')}</span>
    <span className="block text-xs text-slate-400 font-normal">{String(r.email || '')}</span></span>
  ) },
  { key: 'department', label: 'Department', render: (r) => <span className="text-slate-500 capitalize">{String(r.department || 'unassigned').replace(/_/g, ' ')}</span> },
  { key: 'staff_role', label: 'Staff role', render: (r) => <span className="text-slate-500 capitalize">{String(r.staff_role || '—').replace(/_/g, ' ')}</span> },
  { key: 'role', label: 'Access', render: (r) => (
    <ZxBadge tone={String(r.role) === 'admin' ? 'red' : 'blue'}>{String(r.role)}</ZxBadge>
  ) },
];

export default function HrDirectoryPage() {
  const { data, loading, error, reload } = useZxQuery<{ staff: StaffRow[] }>('/api/hr/staff-directory');
  const rows = asArray<StaffRow>(data, ['staff']);

  if (loading) return <ZxLoading label="Loading staff directory…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  return (
    <ZxSection title={`Staff directory (${rows.length})`} hint="Read-only directory — user administration stays in Admin (admin role only)">
      <ZxTable<StaffRow>
        columns={COLUMNS}
        rows={rows}
        searchKeys={['full_name', 'email', 'department', 'staff_role']}
        searchPlaceholder="Search name, email, department…"
        statusKey="role"
        statusOptions={['admin', 'operator']}
        emptyTitle="No staff records"
        emptyHint="Admins add staff from Administration → Staff & Roles."
      />
    </ZxSection>
  );
}
