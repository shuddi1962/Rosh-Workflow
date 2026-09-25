'use client';
import { Hexagon } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function LogoPage() {
  return (
    <PremiumPage eyebrow="Creative · Brand" title="Logo Creator" description="Brand marks and lockups for Roshanal sub-brands — marine anchor routes, security shield routes, mono + color variants." icon={Hexagon}
      stats={[{ label: 'Concepts', value: '32' }, { label: 'Approved', value: '6' }, { label: 'Variants', value: '18' }, { label: 'Exports', value: 'SVG + PNG' }]}
      actions={[{ label: 'Image studio', href: '/dashboard/creative/images', primary: true }]}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['⚓ Marine', '🛡 Secure', '☀ Solar', '◈ Roshanal'].map((l) => (
          <PremiumCard key={l} className="premium-card-hover text-center"><div className="h-24 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-extrabold">{l}</div><p className="mt-2 text-xs font-bold text-slate-500">Primary · Mono · Reversed</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
