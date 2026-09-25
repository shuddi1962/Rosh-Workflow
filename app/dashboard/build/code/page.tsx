'use client';
import { Code2 } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';

export default function CodePage() {
  return (
    <PremiumPage eyebrow="Build · Dev" title="Code Builder" description="Snippets and embeds — WhatsApp buttons, quote forms, store widgets and review badges for any site." icon={Code2}
      stats={[{ label: 'Snippets', value: '18' }, { label: 'Installs', value: '64' }, { label: 'Avg setup', value: '4m' }, { label: 'Framework', value: 'Any' }]}
      actions={[{ label: 'Websites', href: '/dashboard/build/websites', primary: true }]}>
      <PremiumCard><pre className="text-xs leading-relaxed rounded-2xl bg-slate-900 text-emerald-300 p-4 overflow-x-auto">{`<a href="https://wa.me/2348109522432?text=Hello%20Roshanal" data-roshanal="chat">Chat on WhatsApp</a>\n<script src="https://roshanalinfotech.com/embed/quote.js" data-division="marine" />`}</pre></PremiumCard>
    </PremiumPage>
  );
}
