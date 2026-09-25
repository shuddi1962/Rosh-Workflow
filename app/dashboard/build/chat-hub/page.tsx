'use client';
import { MessagesSquare } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function ChatHubPage() {
  return (
    <PremiumPage eyebrow="Build · Live" title="Chat Hub" description="Live-chat command deck — agents + bots side by side, canned replies, survey booking and CRM push." icon={MessagesSquare}
      stats={[{ label: 'Online agents', value: '3' }, { label: 'Waiting', value: '2' }, { label: 'Avg handle', value: '3m 12s' }, { label: 'Resolved', value: '94%' }]}
      actions={[{ label: 'Open inbox', href: '/dashboard/inbox', primary: true }, { label: 'Chatbots', href: '/dashboard/automation/chatbots' }]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PremiumCard className="lg:col-span-2"><p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Live queue</p>
          {[['A. Briggs · Engine inquiry', 'Bot qualified · HP 100 · needs stock confirm'], ['Mrs. Eze · CCTV estate', 'Human · wants Saturday survey']].map(([t, d]) => (
            <div key={t} className="mt-2 flex items-center gap-3 p-3 rounded-2xl border border-slate-100"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /><div><p className="text-sm font-bold">{t}</p><p className="text-xs text-slate-400">{d}</p></div></div>
          ))}
        </PremiumCard>
        <PremiumCard><p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Canned replies</p>
          {['Stock + price in ₦', 'Survey booking link', 'Warranty terms'].map((c) => (<p key={c} className="mt-2 text-sm px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">⚡ {c}</p>))}
        </PremiumCard>
      </div>
    </PremiumPage>
  );
}
