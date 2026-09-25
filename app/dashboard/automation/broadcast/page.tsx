'use client';
import { Radio } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function BroadcastPage() {
  return (
    <PremiumPage eyebrow="Automation · Reach" title="Broadcasting Hub" description="One message → WhatsApp, SMS and email together. Rate-limit safe, STOP-aware, with 48h auto-follow-up." icon={Radio}
      gradient="from-[#10B981] via-[#1468F5] to-[#8B5CF6]"
      stats={[{ label: 'Reach (30d)', value: '48.2k' }, { label: 'Read rate', value: '76%', delta: 'WhatsApp' }, { label: 'Lists', value: '12', delta: '9.4k contacts' }, { label: 'Follow-ups', value: 'Auto', delta: '48h rule' }]}
      actions={[{ label: 'New broadcast', href: '/dashboard/campaigns/create', primary: true }, { label: 'Chatbots', href: '/dashboard/automation/chatbots' }]}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[['WhatsApp blast', '9.4k opted-in · template approved'], ['SMS + WA link', 'Short + trackable · Twilio'], ['Email drip entry', 'Day-1 intro → Day-3 nudge']].map(([t, d]) => (
          <PremiumCard key={t} className="premium-card-hover"><p className="font-extrabold">{t}</p><p className="text-sm text-slate-500 mt-1">{d}</p></PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
