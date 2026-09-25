'use client';
import { Mail } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function EmailMarketingPage() {
  return (
    <PremiumPage
      eyebrow="Marketing · Email"
      title="Email Marketing"
      description="SendGrid-powered обороты: AI templates per division, product images, {{first_name}} personalization and Day 1 → 3 → 7 → 14 drips."
      icon={Mail}
      stats={[
        { label: 'Subscribers', value: '8,412', delta: '+312 this week' },
        { label: 'Open rate', value: '42.8%', delta: '+5.1 pts' },
        { label: 'Click rate', value: '6.4%', delta: 'B2B marine' },
        { label: 'Sent (30d)', value: '26.1k', delta: '4 drips live' },
      ]}
      actions={[
        { label: 'Build campaign', href: '/dashboard/campaigns/create', primary: true },
        { label: 'Templates', href: '/dashboard/campaigns/templates' },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { t: 'Marine B2B intro', d: 'Oil & gas operators · compliance angle' },
          { t: 'Estate security offer', d: 'GRA / Eliozu homeowners · fear → solution' },
          { t: 'Solar vs diesel savings', d: 'PHCN pain · calculator inside' },
        ].map((c) => (
          <PremiumCard key={c.t} className="premium-card-hover">
            <p className="font-extrabold text-slate-900">{c.t}</p>
            <p className="text-sm text-slate-500 mt-1">{c.d}</p>
            <p className="mt-3 text-xs font-bold text-[#1468F5]">Open in builder →</p>
          </PremiumCard>
        ))}
      </div>
    </PremiumPage>
  );
}
