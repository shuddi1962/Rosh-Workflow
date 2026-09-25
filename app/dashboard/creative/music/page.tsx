'use client';
import { Music4 } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function MusicPage() {
  return (
    <PremiumPage eyebrow="Creative · Audio" title="Music Creator" description="Jingls, background beds and WhatsApp-status audio — marine horns, Afrobeat pulses, corporate trust tones." icon={Music4}
      gradient="from-[#8B5CF6] via-[#D946EF] to-[#EF233C]"
      stats={[{ label: 'Tracks', value: '46' }, { label: 'Used in ads', value: '18', delta: '+CTR 9%' }, { label: 'Avg length', value: '0:24' }, { label: 'Licensed', value: '100%' }]}
      actions={[{ label: 'Video editor', href: '/dashboard/creative/video', primary: true }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[['Bonny Hustle (Afrobeat 102bpm)', 'UGC + reels'], ['Secure Home (warm piano)', 'CCTV + estate ads'], ['Harbour Horn (marine)', 'Engine + boat intros']].map(([t, d]) => (
          <PremiumCard key={t} className="premium-card-hover"><div className="flex items-end gap-1 h-10">{[8, 14, 10, 18, 12, 20, 9, 15].map((h, i) => (<span key={i} className="w-1.5 rounded-full bg-gradient-to-t from-[#8B5CF6] to-[#EF233C]" style={{ height: h * 2 }} />))}</div><p className="mt-3 font-extrabold text-sm">{t}</p><p className="text-xs text-slate-400">{d}</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
