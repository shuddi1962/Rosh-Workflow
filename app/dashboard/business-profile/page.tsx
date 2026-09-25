'use client';
import { Building2, MapPin, Phone, Sparkles } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function BusinessProfilePage() {
  return (
    <PremiumPage
      eyebrow="Core · Business Profile"
      title="Roshanal Infotech Limited"
      description="Your single source of truth — divisions, branches, contacts and brand voice. Every AI post, ad and broadcast pulls from here."
      icon={Building2}
      stats={[
        { label: 'Divisions', value: '2', delta: 'Marine + Tech' },
        { label: 'Locations', value: '3', delta: 'PH ×2 · Yenagoa' },
        { label: 'Products linked', value: '48', delta: '+6 this month' },
        { label: 'Brand voice', value: 'Active', delta: 'Nigerian English' },
      ]}
      actions={[
        { label: 'Manage products', href: '/dashboard/products', primary: true },
        { label: 'Workspace settings', href: '/dashboard/settings' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PremiumCard>
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Head office</p>
          <p className="mt-2 text-sm font-bold text-slate-900 flex gap-2"><MapPin className="w-4 h-4 text-[#1468F5] shrink-0 mt-0.5" /> No 18A Rumuola/Rumuadaolu Road, Adjacent Rumuadaolu Town Hall, Port Harcourt</p>
          <p className="mt-3 text-xs font-extrabold uppercase tracking-widest text-slate-400">Branches</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
            <li>· 41 Eastern Bypass, Opp NDDC Building, PH</li>
            <li>· 223 Chief Melfold Okilo Way, Amarat, Yenagoa</li>
          </ul>
        </PremiumCard>
        <PremiumCard>
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Contact channels</p>
          <p className="mt-2 text-sm font-bold text-slate-900 flex gap-2"><Phone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> 08109522432 · 08033170802 · 08180388018</p>
          <p className="mt-2 text-sm text-slate-600">info@roshanalinfotech.com · roshanalinfotech.com</p>
          <p className="mt-3 text-xs text-slate-500">WhatsApp-first CTAs are auto-appended to every AI post.</p>
        </PremiumCard>
        <PremiumCard className="bg-gradient-to-br from-slate-900 to-[#14275a] !border-transparent text-white">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-white/60"><Sparkles className="w-4 h-4" /> Brand voice</p>
          <p className="mt-2 text-sm leading-relaxed text-white/85">Professional yet approachable, expert authority, local Niger Delta context, urgent WhatsApp-friendly CTAs. Prices in ₦, never $.</p>
        </PremiumCard>
      </div>
    </PremiumPage>
  );
}
