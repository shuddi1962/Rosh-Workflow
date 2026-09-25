'use client';
import { ScanSearch } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function IndexingPage() {
  return (
    <PremiumPage eyebrow="Marketing · Indexing" title="Auto-Indexing" description="Push new pages, products and posts to Google instantly — sitemap pings, URL inspection and index-status tracking." icon={ScanSearch}
      stats={[{ label: 'URLs indexed', value: '342', delta: '96% coverage' }, { label: 'Pending', value: '8' }, { label: 'Avg index time', value: '3.2h', delta: '-41%' }, { label: 'Errors', value: '0' }]}
      actions={[{ label: 'Site manager', href: '/dashboard/marketing/site', primary: true }]}>
      <PremiumCard><div className="flex items-center gap-4"><div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full w-[96%] rounded-full bg-gradient-to-r from-[#1468F5] to-[#8B5CF6]" /></div><p className="text-sm font-extrabold">96%</p></div><p className="mt-2 text-xs text-slate-400">342 of 350 URLs indexed · last ping 12 minutes ago</p></PremiumCard>
    </PremiumPage>
  );
}
