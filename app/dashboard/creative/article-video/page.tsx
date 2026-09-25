'use client';
import { Newspaper } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function ArticleVideoPage() {
  return (
    <PremiumPage eyebrow="Creative · Repurpose" title="Article → Video" description="Turn posts, blogs and specs into reels: script → scenes → captions → music — ready for IG, TikTok and WhatsApp Status." icon={Newspaper}
      stats={[{ label: 'Converted', value: '64' }, { label: 'Avg watch', value: '71%' }, { label: 'Reels / week', value: '9' }, { label: 'Top hook', value: '“PHCN off?”' }]}
      actions={[{ label: 'Video editor', href: '/dashboard/creative/video', primary: true }, { label: 'Content writer', href: '/dashboard/content' }]}>
      <PremiumCard><div className="grid sm:grid-cols-3 gap-3 text-sm">
        {[['1 · Script', 'Hook + 3 beats + WA CTA, auto from article'], ['2 · Scenes', 'B-roll map: warehouse, install, demo'], ['3 · Publish', 'Captions + hashtags + 07:00/19:00 slots']].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-slate-100 p-4"><p className="font-extrabold">{t}</p><p className="text-slate-500 mt-1">{d}</p></div>
        ))}
      </div></PremiumCard>
    </PremiumPage>
  );
}
