'use client';
import { Radar, Building2, Ship, Hotel } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

const segments = [
  { icon: Ship, name: 'Oil & gas marine ops', count: '312 targets', src: 'Google Maps + LinkedIn' },
  { icon: Hotel, name: 'Hotels & estates (GRA, Eliozu)', count: '486 targets', src: 'Instagram + Maps' },
  { icon: Building2, name: 'Banks, schools & hospitals', count: '204 targets', src: 'Search + referrals' },
];

export default function ProspectingPage() {
  return (
    <PremiumPage
      eyebrow="Core · Prospecting"
      title="Prospecting Engine"
      description="Discover oil companies, boat operators, estates and fleets across Rivers & Bayelsa — then enrich, score and push to CRM in one click."
      icon={Radar}
      stats={[
        { label: 'New prospects', value: '1,002', delta: '+148 this week' },
        { label: 'Enriched', value: '764', delta: 'phone + email' },
        { label: 'Hot tier', value: '96', delta: 'score 80+' },
        { label: 'Pushed to CRM', value: '231', delta: 'this month' },
      ]}
      actions={[
        { label: 'Open lead lists', href: '/dashboard/crm/leads', primary: true },
        { label: 'Run new scrape', href: '/dashboard/search' },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {segments.map((s) => (
          <PremiumCard key={s.name} className="premium-card-hover">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1468F5] to-[#8B5CF6] text-white flex items-center justify-center shadow-lg"><s.icon className="w-5 h-5" /></span>
            <p className="mt-3 font-extrabold text-slate-900">{s.name}</p>
            <p className="text-sm font-bold text-[#1468F5]">{s.count}</p>
            <p className="text-xs text-slate-400 mt-1">{s.src}</p>
          </PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
