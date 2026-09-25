'use client';
import { LineChart } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function CommerceIntelPage() {
  return (
    <PremiumPage eyebrow="Commerce · Intelligence" title="Commerce Intelligence" description="Margins, demand signals and ₦ pricing power across Suzuki, Yamaha, Hikvision and solar — know what to stock next." icon={LineChart}
      stats={[{ label: 'GMV (30d)', value: '₦38.4M', delta: '+18%' }, { label: 'Margin', value: '31.2%' }, { label: 'Sell-through', value: '74%', delta: 'PH warehouse' }, { label: 'Stockouts', value: '3', delta: 'reorder now' }]}
      actions={[{ label: 'Product research', href: '/dashboard/commerce/research', primary: true }, { label: 'Online store', href: '/dashboard/commerce/store' }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[['Outboard 75–100HP', 'Demand +34% · margin 28% · reorder 12 units'], ['Hikvision 8-ch kits', 'Estate pull · margin 36% · bundle solar'], ['Lithium 5kWh', 'PHCN outage spike · margin 24% · upsell inverter']].map(([t, d]) => (
          <PremiumCard key={t} className="premium-card-hover"><p className="font-extrabold">{t}</p><p className="text-sm text-slate-500 mt-1">{d}</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
