'use client';
import { Server } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function HostingPage() {
  return (
    <PremiumPage eyebrow="Build · Infra" title="Hosting & Domains" description="Vercel deploys, DNS, SSL and storage — roshanalinfotech.com and campaign microsites, all green." icon={Server}
      stats={[{ label: 'Projects', value: '6' }, { label: 'Uptime', value: '99.99%' }, { label: 'Domains', value: '3', delta: 'SSL ✓' }, { label: 'Edge', value: 'Lagos', delta: 'nearest POP' }]}
      actions={[{ label: 'Websites', href: '/dashboard/build/websites', primary: true }]}>
      <PremiumCard><div className="divide-y divide-slate-100 text-sm">
        {[['roshanalinfotech.com', 'Production · SSL ✓ · 1.1s'], ['quote.roshanalinfotech.com', 'Funnel · SSL ✓ · 0.9s'], ['promo.roshanalinfotech.com', 'Preview · SSL ✓']].map(([d, s]) => (
          <div key={d} className="flex items-center gap-3 py-3"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="font-bold flex-1">{d}</span><span className="text-xs text-slate-400">{s}</span></div>
        ))}
      </div></PremiumCard>
    </PremiumPage>
  );
}
