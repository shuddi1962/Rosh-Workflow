'use client';
import { ReceiptText } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function InvoicesPage() {
  return (
    <PremiumPage eyebrow="Commerce · Finance" title="Invoices & Payments" description="₦ invoices, receipts, custody notes and payment links — reconciled with inventory and operations." icon={ReceiptText}
      stats={[{ label: 'Outstanding', value: '₦6.8M', delta: '14 open' }, { label: 'Paid (30d)', value: '₦31.2M' }, { label: 'Overdue', value: '₦940k', delta: '4 follow-ups' }, { label: 'Receipts', value: '298' }]}
      actions={[{ label: 'Operations', href: '/dashboard/operations', primary: true }, { label: 'Online store', href: '/dashboard/commerce/store' }]}>
      <PremiumCard><div className="divide-y divide-slate-100 text-sm">
        {[['INV-2026-0841 · Bonny Marine Ltd', '₦8.4M', 'Paid'], ['INV-2026-0842 · GRA Estate', '₦1.15M', 'Sent'], ['INV-2026-0843 · Fleet Ops T/A', '₦2.6M', 'Overdue']].map(([n, a, s]) => (
          <div key={n} className="flex items-center gap-3 py-3"><span className="font-bold flex-1">{n}</span><span className="font-extrabold tabular-nums">{a}</span><span className="text-[11px] font-extrabold uppercase px-2 py-1 rounded-lg bg-slate-100">{s}</span></div>
        ))}
      </div></PremiumCard>
    </PremiumPage>
  );
}
