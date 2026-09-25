'use client';
import { Bot } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function ChatbotsPage() {
  return (
    <PremiumPage eyebrow="Automation · AI" title="Chatbots" description="WhatsApp + site assistants that qualify marine/tech inquiries, quote install ranges and book surveys 24/7." icon={Bot}
      stats={[{ label: 'Active bots', value: '4' }, { label: 'Chats (7d)', value: '1,284', delta: '+19%' }, { label: 'Qualified', value: '312' }, { label: 'Handoff rate', value: '8%' }]}
      actions={[{ label: 'Broadcasting', href: '/dashboard/automation/broadcast', primary: true }, { label: 'Inbox', href: '/dashboard/inbox' }]}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[['Marine qualifier', 'Engine HP → use-case → stock'], ['CCTV estimator', 'Channels → property → quote'], ['Solar survey booker', 'Load → LGA → date'], ['After-hours guard', 'FAQ + human handoff']].map(([t, d]) => (
          <PremiumCard key={t} className="premium-card-hover"><span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">Live</span><p className="mt-2 font-extrabold">{t}</p><p className="text-sm text-slate-500">{d}</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
