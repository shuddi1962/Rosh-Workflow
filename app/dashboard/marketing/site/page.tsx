'use client';
import { AppWindow } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function SiteManagerPage() {
  return (
    <PremiumPage eyebrow="Marketing · Site" title="Site Manager" description="Pages, menus, GMB posts and locations — keep roshanalinfotech.com and every branch listing fresh from one deck." icon={AppWindow}
      stats={[{ label: 'Pages', value: '24' }, { label: 'GMB posts (30d)', value: '18', delta: '+weekly' }, { label: 'Uptime', value: '99.98%' }, { label: 'Speed', value: '1.2s', delta: 'LCP' }]}
      actions={[{ label: 'Websites & funnels', href: '/dashboard/build/websites', primary: true }, { label: 'SEO engine', href: '/dashboard/marketing/seo' }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ t: 'Homepage hero', d: 'Marine + Tech split · WhatsApp CTA' }, { t: 'Hikvision hub', d: 'Packages, demos, GRA case study' }, { t: 'Outboard engines', d: 'Suzuki/Yamaha specs + ₦ pricing' }].map((p) => (
          <PremiumCard key={p.t} className="premium-card-hover"><p className="font-extrabold text-slate-900">{p.t}</p><p className="text-sm text-slate-500 mt-1">{p.d}</p><p className="mt-3 inline-block text-[11px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">Published</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
