'use client';
import { Inbox, MessageCircle, Mail, Send } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

const threads = [
  { from: 'Engr. Tamuno · Bonny Marine', msg: 'Do you have Suzuki 100HP in stock in PH?', ch: 'WhatsApp', time: '2m' },
  { from: 'GRA Estate Manager', msg: 'Need quote: 8-ch Hikvision + solar backup', ch: 'Email', time: '19m' },
  { from: 'Fleet Ops · Trans Amadi', msg: 'Car trackers for 14 vehicles — price?', ch: 'Instagram', time: '44m' },
  { from: 'NDDC Contractor', msg: 'Fiberglass repair materials availability?', ch: 'WhatsApp', time: '1h' },
];

export default function InboxPage() {
  return (
    <PremiumPage
      eyebrow="Core · Inbox"
      title="Unified Inbox"
      description="WhatsApp, email and social DMs in one premium stream — reply fast, assign, and push hot chats straight into CRM."
      icon={Inbox}
      stats={[
        { label: 'Open threads', value: '27', delta: '9 unread' },
        { label: 'Avg reply time', value: '4m', delta: '-38% faster' },
        { label: 'Qualified today', value: '11', delta: 'from WhatsApp' },
        { label: 'CSAT', value: '4.9', delta: '★★★★★' },
      ]}
      actions={[
        { label: 'Open WhatsApp', href: '/dashboard/whatsapp', primary: true },
        { label: 'View CRM', href: '/dashboard/crm' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PremiumCard className="lg:col-span-2">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Priority threads</p>
          <div className="space-y-2">
            {threads.map((t) => (
              <div key={t.from} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-[#1468F5]/30 hover:shadow-lg transition-all">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1468F5]/15 to-[#8B5CF6]/15 flex items-center justify-center font-extrabold text-[#1468F5]">{t.from.charAt(0)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{t.from} <span className="ml-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">{t.ch}</span></p>
                  <p className="text-[13px] text-slate-500 truncate">{t.msg}</p>
                </div>
                <span className="text-[11px] font-bold text-slate-400">{t.time}</span>
              </div>
            ))}
          </div>
        </PremiumCard>
        <PremiumCard>
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Quick reply</p>
          <textarea rows={4} placeholder="Type a reply… AI can draft it in brand voice" className="mt-3 w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-4 focus:ring-[#1468F5]/10 focus:border-[#1468F5]/50" />
          <div className="mt-3 flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-[#1468F5] transition"><Send className="w-3.5 h-3.5" /> Send</button>
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 transition"><MessageCircle className="w-3.5 h-3.5" /> AI draft</button>
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 transition"><Mail className="w-3.5 h-3.5" /> Email</button>
          </div>
        </PremiumCard>
      </div>
    </PremiumPage>
  );
}
