'use client';
import { LayoutTemplate } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function WebsitesPage() {
  return (
    <PremiumPage eyebrow="Build · Web" title="Websites & Funnels" description="High-converting landing pages and quote funnels for engines, CCTV and solar — deployed on Vercel in minutes." icon={LayoutTemplate}
      stats={[{ label: 'Live pages', value: '9' }, { label: 'Conv. rate', value: '6.1%', delta: '+1.4 pts' }, { label: 'Funnels', value: '4', delta: 'quote → WA' }, { label: 'Deploy', value: '<2m', delta: 'Vercel' }]}
      actions={[{ label: 'Hosting & domains', href: '/dashboard/build/hosting', primary: true }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[['Engine quote funnel', 'HP selector → stock → WA'], ['Estate security page', 'Fear → proof → survey'], ['Solar savings calc', 'Diesel input → payback']].map(([t, d]) => (
          <PremiumCard key={t} className="premium-card-hover"><p className="font-extrabold">{t}</p><p className="text-sm text-slate-500 mt-1">{d}</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
