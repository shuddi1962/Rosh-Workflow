'use client';
import { MessageSquareText } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function SmsPage() {
  return (
    <PremiumPage
      eyebrow="Marketing · SMS"
      title="SMS Marketing"
      description="Short, punchy Twilio SMS with WhatsApp short-links — delivery tracked, STOP opt-outs handled automatically."
      icon={MessageSquareText}
      stats={[
        { label: 'Delivery rate', value: '98.2%', delta: 'Twilio NG' },
        { label: 'Reply rate', value: '11.6%', delta: 'with WA link' },
        { label: 'Sent (30d)', value: '14.8k', delta: '3 blasts' },
        { label: 'Opt-outs', value: '0.4%', delta: 'healthy' },
      ]}
      actions={[
        { label: 'New SMS blast', href: '/dashboard/campaigns/create', primary: true },
        { label: 'Broadcasting hub', href: '/dashboard/automation/broadcast' },
      ]}
    >
      <PremiumCard>
        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Live preview (160 chars)</p>
        <div className="mt-3 max-w-sm rounded-2xl rounded-tl-md bg-slate-900 text-white text-sm p-4 shadow-xl">
          ROSHANAL: Suzuki 100HP back in PH stock — no Lagos trip needed. Genuine + warranty. Reply YES or chat wa.me/2348109522432. STOP to opt out
        </div>
        <p className="mt-3 text-xs text-slate-400">142/160 characters · 1 segment · includes WhatsApp deep link</p>
      </PremiumCard>
    </PremiumPage>
  );
}
