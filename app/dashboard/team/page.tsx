'use client';
import { ShieldCheck } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

const roles = [
  ['Admin', 'Full access · vault, staff, billing', '2 seats'],
  ['Operator', 'Content, social, campaigns', '6 seats'],
  ['Sales', 'CRM, inbox, quotes only', '4 seats'],
  ['Installer', 'Calendars + jobs only', '8 seats'],
];

export default function TeamPage() {
  return (
    <PremiumPage eyebrow="System · Team" title="Team & Roles" description="Operators, sales and install crews — role-based access mirrors the sidebar: people only see their modules." icon={ShieldCheck}
      stats={[{ label: 'Members', value: '20' }, { label: 'Roles', value: '4' }, { label: 'Pending invites', value: '3' }, { label: 'Active today', value: '14' }]}
      actions={[{ label: 'Workspace settings', href: '/dashboard/settings', primary: true }]}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map(([r, d, s]) => (
          <PremiumCard key={r} className="premium-card-hover"><p className="font-extrabold">{r}</p><p className="text-sm text-slate-500 mt-1">{d}</p><p className="mt-3 text-xs font-extrabold text-[#1468F5]">{s}</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
