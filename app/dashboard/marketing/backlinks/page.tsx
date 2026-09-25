'use client';
import { Link2 } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function BacklinksPage() {
  return (
    <PremiumPage eyebrow="Marketing · Backlinks" title="Backlink Manager" description="Monitor every link, recover lost ones and target marine directories, estate blogs and energy press for authority." icon={Link2}
      stats={[{ label: 'Live links', value: '412', delta: '+28' }, { label: 'Domain rating', value: '38', delta: '+4' }, { label: 'Lost (30d)', value: '6', delta: '2 recovered' }, { label: 'Targets', value: '54' }]}
      actions={[{ label: 'SEO engine', href: '/dashboard/marketing/seo', primary: true }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ t: 'Marine directories', d: '12 listings live · 5 pending' }, { t: 'Estate & property blogs', d: 'Guest post pipeline · 8 drafts' }, { t: 'Energy press', d: 'Solar savings stories · 3 pitched' }].map((c) => (
          <PremiumCard key={c.t} className="premium-card-hover"><p className="font-extrabold text-slate-900">{c.t}</p><p className="text-sm text-slate-500 mt-1">{c.d}</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
