'use client';
import { CalendarDays } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function CalendarsPage() {
  return (
    <PremiumPage eyebrow="Build · Bookings" title="Calendars" description="Site surveys, installations and showroom visits — synced, reminded via WhatsApp, no clashes with install crews." icon={CalendarDays}
      stats={[{ label: 'Bookings (7d)', value: '46', delta: '+12' }, { label: 'No-shows', value: '4%', delta: '-3 pts' }, { label: 'Crews', value: '3', delta: 'Marine · CCTV · Solar' }, { label: 'Reminders', value: 'Auto WA' }]}
      actions={[{ label: 'Chat hub', href: '/dashboard/build/chat-hub', primary: true }]}>
      <PremiumCard><div className="grid sm:grid-cols-7 gap-2 text-center text-sm">
        {['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16', 'Sat 17', 'Sun 18'].map((d, i) => (
          <div key={d} className={`rounded-2xl border p-3 ${i === 2 ? 'border-[#1468F5] bg-[#1468F5]/5 font-extrabold text-[#1468F5]' : 'border-slate-100 text-slate-500'}`}>{d}<span className="block text-xs mt-1">{[4, 6, 9, 5, 7, 3, 1][i]} visits</span></div>
        ))}
      </div></PremiumCard>
    </PremiumPage>
  );
}
