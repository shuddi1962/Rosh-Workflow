'use client';
import { FlaskConical } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function ResearchPage() {
  return (
    <PremiumPage eyebrow="Commerce · Research" title="Product Research" description="Score winning marine + tech products by demand, margin, competition and install complexity — before you import." icon={FlaskConical}
      stats={[{ label: 'Tracked', value: '214' }, { label: 'Winners', value: '23', delta: 'score 80+' }, { label: 'Avg margin', value: '33%' }, { label: 'Watchlist', value: '11' }]}
      actions={[{ label: 'Commerce intel', href: '/dashboard/commerce/intelligence', primary: true }]}>
      <PremiumCard><div className="divide-y divide-slate-100 text-sm">
        {[['Biometric smart lock X8', '92', 'Estates + offices · low install friction'], ['Solar street-light 200W', '88', 'Churches + compounds · bulk orders'], ['Bilge pump 2000GPH', '85', 'Boat operators · consumable repeat']].map(([n, s, d]) => (
          <div key={n} className="flex items-center gap-3 py-3"><span className="font-bold flex-1">{n}<span className="block text-xs font-normal text-slate-400">{d}</span></span><span className="text-xs font-extrabold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">Score {s}</span></div>
        ))}
      </div></PremiumCard>
    </PremiumPage>
  );
}
