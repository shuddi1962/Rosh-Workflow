'use client';
import { Rss } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

const feeds = [
  { n: 'Vanguard · Maritime', c: '12 items', t: 'NIMASA safety update' },
  { n: 'Punch · Security PH', c: '9 items', t: 'Estate robbery prevention' },
  { n: 'Guardian Energy', c: '7 items', t: 'Diesel vs solar costs' },
  { n: 'Channels TV', c: '5 items', t: 'Bonny waterway operations' },
];

export default function RssPage() {
  return (
    <PremiumPage eyebrow="Marketing · RSS" title="RSS Feed Manager" description="Marine + security news wired straight into Trend Discovery and the Content Brain — every story becomes a post angle." icon={Rss}
      stats={[{ label: 'Active feeds', value: '14' }, { label: 'Items today', value: '86' }, { label: 'Turned to posts', value: '19', delta: '+auto-draft' }, { label: 'Refresh', value: '15m' }]}
      actions={[{ label: 'Trend discovery', href: '/dashboard/trends', primary: true }]}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {feeds.map((f) => (<PremiumCard key={f.n} className="premium-card-hover"><p className="font-extrabold text-slate-900 text-sm">{f.n}</p><p className="text-xs text-slate-400 mt-0.5">{f.c}</p><p className="text-sm text-slate-600 mt-2">Latest: {f.t}</p></PremiumCard>))}
      </div>
    </PremiumPage>
  );
}
