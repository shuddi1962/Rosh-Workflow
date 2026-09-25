'use client';

import React from 'react';
import { HeartHandshake, Building2, UserCheck, ShieldCheck } from 'lucide-react';
import { useZxQuery, asArray } from '@/components/zorixza/data';
import { ZxKpi, ZxSection, ZxLoading, ZxError, ZxEmpty } from '@/components/zorixza/ui';

interface StaffRow extends Record<string, unknown> {
  id: string; full_name: string; email: string; role: string;
  department: string | null; staff_role: string | null;
}

export default function HrOverviewPage() {
  const { data, loading, error, reload } = useZxQuery<{ staff: StaffRow[] }>('/api/hr/staff-directory');
  const rows = asArray<StaffRow>(data, ['staff']);

  if (loading) return <ZxLoading label="Pulling headcount…" />;
  if (error) return <ZxError message={error} onRetry={reload} />;

  const depts = new Set(rows.map((r) => String(r.department || 'unassigned')));
  const admins = rows.filter((r) => String(r.role) === 'admin').length;
  const operators = rows.length - admins;
  const byDept = [...depts].map((d) => ({
    dept: d,
    count: rows.filter((r) => String(r.department || 'unassigned') === d).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ZxKpi icon={HeartHandshake} label="Headcount" value={String(rows.length)} sub="Active staff records" />
        <ZxKpi icon={Building2} label="Departments" value={String(depts.size)} sub="With assigned staff" />
        <ZxKpi icon={UserCheck} label="Operators" value={String(operators)} sub="Day-to-day workforce" />
        <ZxKpi icon={ShieldCheck} label="Admins" value={String(admins)} sub="Full-access roles" />
      </div>

      <div className="mt-4">
        <ZxSection title="Headcount by department" hint="Live from the staff directory">
          {byDept.length === 0 ? (
            <ZxEmpty title="No staff yet" hint="Admins add staff from Administration → Staff." />
          ) : (
            <div className="space-y-2.5">
              {byDept.map((d) => (
                <div key={d.dept}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-700 capitalize">{d.dept.replace(/_/g, ' ')}</span>
                    <span className="text-slate-500 tabular-nums">{d.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${rows.length ? (d.count / rows.length) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ZxSection>
      </div>
    </>
  );
}
