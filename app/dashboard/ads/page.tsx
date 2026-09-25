'use client';
import { Megaphone, Eye, Clapperboard } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function AdsPage() {
  return (
    <PremiumPage eyebrow="Ads Manager" title="Ads Command Deck" description="Meta, Google and TikTok spend in one view — winning angles from Ad Intelligence, UGC creatives ready to launch." icon={Megaphone}
      gradient="from-[#EF233C] via-[#F97316] to-[#F59E0B]"
      stats={[{ label: 'Active ads', value: '18', delta: 'Meta 11 · G 5 · TT 2' }, { label: 'Spend (30d)', value: '₦4.2M' }, { label: 'ROAS', value: '4.8×', delta: '+0.6' }, { label: 'Cost / lead', value: '₦1,850', delta: '-12%' }]}
      actions={[{ label: 'Ad intelligence', href: '/dashboard/competitors', primary: true }, { label: 'UGC ads', href: '/dashboard/creative/ugc' }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PremiumCard className="premium-card-hover"><Eye className="w-5 h-5 text-[#EF233C]" /><p className="mt-2 font-extrabold">Steal this angle</p><p className="text-sm text-slate-500">“PHCN off 3 days?” — competitor fear angle, 41d running. Counter with solar savings calc.</p></PremiumCard>
        <PremiumCard className="premium-card-hover"><Clapperboard className="w-5 h-5 text-[#8B5CF6]" /><p className="mt-2 font-extrabold">Top UGC</p><p className="text-sm text-slate-500">Unboxing: Suzuki 100HP — 6.2% CTR, ₦1,240 CPL. Scale to lookalikes.</p></PremiumCard>
        <PremiumCard className="premium-card-hover"><Megaphone className="w-5 h-5 text-[#1468F5]" /><p className="mt-2 font-extrabold">Budget guard</p><p className="text-sm text-slate-500">Auto-pause if CPL &gt; ₦3,000 for 48h. Daily cap ₦180k.</p></PremiumCard>
      </div>
    </PremiumPage>
  );
}
