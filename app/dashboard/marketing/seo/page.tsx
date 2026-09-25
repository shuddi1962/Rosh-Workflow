'use client';
import { Globe, ArrowUpRight } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

const kws = [
  { k: 'cctv installation port harcourt', pos: '#2', move: '+3' },
  { k: 'suzuki outboard engine price nigeria', pos: '#4', move: '+1' },
  { k: 'solar inverter price nigeria', pos: '#6', move: '+5' },
  { k: 'hikvision camera price nigeria', pos: '#3', move: '+2' },
];

export default function SeoPage() {
  return (
    <PremiumPage
      eyebrow="Marketing · SEO Engine"
      title="SEO Engine"
      description="Own Port Harcourt search — track money keywords, fix on-page gaps and auto-generate location pages for marine + security."
      icon={Globe}
      stats={[
        { label: 'Tracked keywords', value: '128', delta: '34 in top 3' },
        { label: 'Organic leads', value: '312/mo', delta: '+22%' },
        { label: 'Site health', value: '92/100', delta: 'Excellent' },
        { label: 'Location pages', value: '18', delta: 'PH + Yenagoa' },
      ]}
      actions={[
        { label: 'Manage keywords', href: '/dashboard/marketing/keywords', primary: true },
        { label: 'Backlinks', href: '/dashboard/marketing/backlinks' },
      ]}
    >
      <PremiumCard>
        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Money keywords climbing</p>
        <div className="divide-y divide-slate-100">
          {kws.map((r) => (
            <div key={r.k} className="flex items-center gap-3 py-3">
              <span className="text-sm font-bold text-slate-800 flex-1">{r.k}</span>
              <span className="text-sm font-extrabold text-slate-900 tabular-nums">{r.pos}</span>
              <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-600"><ArrowUpRight className="w-3.5 h-3.5" />{r.move}</span>
            </div>
          ))}
        </div>
      </PremiumCard>
    </PremiumPage>
  );
}
