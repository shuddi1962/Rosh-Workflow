'use client';
import { Sparkles } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function NameGenPage() {
  return (
    <PremiumPage eyebrow="Build · Brand" title="Business Name Generator" description="Nigerian-ready names with .com checks — marine authority, tech trust, short + WhatsApp-friendly." icon={Sparkles}
      stats={[{ label: 'Generated', value: '1.2k' }, { label: 'With .com free', value: '214' }, { label: 'Saved', value: '38' }, { label: 'Lang', value: 'EN + pidgin' }]}
      actions={[{ label: 'Check hosting', href: '/dashboard/build/hosting', primary: true }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[['BonnyDrive Marine', 'bonnydrive.com ✓'], ['ShieldNest Security', 'shieldnest.ng ✓'], ['SunSteady Power', 'sunsteady.com ✓']].map(([n, d]) => (
          <PremiumCard key={n} className="premium-card-hover"><p className="font-extrabold text-lg">{n}</p><p className="text-xs font-bold text-emerald-600 mt-1">{d}</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
