'use client';
import { GraduationCap } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function CoursesPage() {
  return (
    <PremiumPage eyebrow="Build · Learn" title="Courses & Memberships" description="Installer training, boat-safety briefings and estate-manager security courses — gated content + certificates." icon={GraduationCap}
      stats={[{ label: 'Courses', value: '6' }, { label: 'Members', value: '412', delta: '+48' }, { label: 'Completion', value: '68%' }, { label: 'Revenue', value: '₦1.9M', delta: '30d' }]}
      actions={[{ label: 'Presentations', href: '/dashboard/creative/presentations', primary: true }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[['Outboard Care 101', 'Owners · 2h · certificate'], ['CCTV Operator Basics', 'Estates · 3h · practical'], ['Solar Sizing Masterclass', 'Installers · 4h · pro']].map(([t, d]) => (
          <PremiumCard key={t} className="premium-card-hover"><p className="font-extrabold">{t}</p><p className="text-sm text-slate-500 mt-1">{d}</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
