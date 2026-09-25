'use client';
import { Presentation } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function PresentationsPage() {
  return (
    <PremiumPage eyebrow="Creative · Decks" title="Presentations" description="B2B pitch decks for oil & gas, estates and banks — marine compliance, security ROI, solar savings." icon={Presentation}
      stats={[{ label: 'Decks', value: '12' }, { label: 'Sent (30d)', value: '34' }, { label: 'Win rate', value: '28%' }, { label: 'Avg slides', value: '14' }]}
      actions={[{ label: 'Design studio', href: '/dashboard/creative', primary: true }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[['NNPC Contractor Pack', 'Compliance + safety fleet'], ['Estate Security ROI', 'GRA case · before/after'], ['Solar vs Diesel', 'Payback calculator slide']].map(([t, d]) => (
          <PremiumCard key={t} className="premium-card-hover"><div className="h-24 rounded-2xl bg-gradient-to-br from-slate-900 to-[#1d3a8a] text-white flex items-center justify-center font-extrabold">◧ {t.split(' ')[0]}</div><p className="mt-3 font-extrabold text-sm">{t}</p><p className="text-xs text-slate-400">{d}</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
