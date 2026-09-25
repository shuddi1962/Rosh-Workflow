'use client';
import { KeyRound, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

const rows = [
  { k: 'hikvision cctv port harcourt', v: '2.1k/mo', d: 'High', pos: '#2', up: true },
  { k: 'yamaha 75hp price nigeria', v: '880/mo', d: 'High', pos: '#4', up: true },
  { k: 'solar batteries rivers state', v: '1.4k/mo', d: 'Medium', pos: '#7', up: false },
  { k: 'smart door lock nigeria', v: '960/mo', d: 'Medium', pos: '#5', up: true },
];

export default function KeywordsPage() {
  return (
    <PremiumPage eyebrow="Marketing · Keywords" title="Keyword Tracker" description="Every money keyword across marine + tech — volume, difficulty, rank movement and the exact post mapped to win it." icon={KeyRound}
      stats={[{ label: 'Tracked', value: '128' }, { label: 'Top 3', value: '34', delta: '+6' }, { label: 'Volume', value: '48k/mo' }, { label: 'Opportunity', value: '₦214M', delta: 'pipeline' }]}
      actions={[{ label: 'SEO engine', href: '/dashboard/marketing/seo', primary: true }]}>
      <PremiumCard>
        <div className="divide-y divide-slate-100">
          {rows.map((r) => (
            <div key={r.k} className="flex items-center gap-3 py-3 text-sm">
              <span className="font-bold text-slate-800 flex-1">{r.k}</span>
              <span className="hidden sm:block text-xs text-slate-400 w-20">{r.v}</span>
              <span className="hidden sm:block text-xs font-bold text-slate-500 w-16">{r.d}</span>
              <span className="font-extrabold tabular-nums">{r.pos}</span>
              {r.up ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-red-400" />}
            </div>
          ))}
        </div>
      </PremiumCard>
    </PremiumPage>
  );
}
