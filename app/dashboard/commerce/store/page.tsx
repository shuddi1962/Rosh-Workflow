'use client';
import { ShoppingBag } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function StorePage() {
  return (
    <PremiumPage eyebrow="Commerce · Store" title="Online Store" description="WhatsApp-first catalog, cart and checkout — products, ₦ pricing, delivery zones (PH, Yenagoa, Niger Delta)." icon={ShoppingBag}
      stats={[{ label: 'Orders (30d)', value: '312', delta: '+24%' }, { label: 'Conversion', value: '3.8%' }, { label: 'AOV', value: '₦450k' }, { label: 'Abandoned', value: '18%', delta: 'WA recovery on' }]}
      actions={[{ label: 'Manage products', href: '/dashboard/products', primary: true }, { label: 'Invoices', href: '/dashboard/commerce/invoices' }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[['Suzuki 100HP', '₦8.4M · in stock · PH warehouse'], ['Hikvision 8-ch kit', '₦1.15M · install incl.'], ['5kWh lithium + 3.5kVA', '₦3.9M · same-day survey']].map(([t, d]) => (
          <PremiumCard key={t} className="premium-card-hover"><div className="h-28 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl">📦</div><p className="mt-3 font-extrabold">{t}</p><p className="text-sm text-slate-500">{d}</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
