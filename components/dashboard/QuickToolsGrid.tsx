'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PenLine, Video, Target, Users, BarChart3, Settings } from 'lucide-react';

const tools = [
  { icon: PenLine, label: 'Content Generator', desc: 'AI-powered content creation', color: '#1468F5', href: '/dashboard/content' },
  { icon: Users, label: 'Lead Finder', desc: 'Discover new prospects', color: '#10B981', href: '/dashboard/crm/leads' },
  { icon: Video, label: 'Video Studio', desc: 'Create UGC video scripts', color: '#EF233C', href: '/dashboard/creative/video' },
  { icon: Settings, label: 'Automation', desc: 'Set up workflows', color: '#1468F5', href: '/dashboard/campaigns/automation' },
  { icon: BarChart3, label: 'Reports', desc: 'Generate insights', color: '#1468F5', href: '/dashboard/analytics' },
  { icon: Target, label: 'Competitor Analysis', desc: 'Spy on competitors', color: '#EF233C', href: '/dashboard/competitors' },
];

export const QuickToolsGrid: React.FC = () => {
  const router = useRouter();
  return (
  <div className="bg-white rounded-2xl border border-slate-200 p-6">
    <h3 className="text-base font-bold text-slate-900 mb-5">Quick Tools</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {tools.map((t) => (
        <button
          key={t.label}
          onClick={() => router.push(t.href)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-[#1468F5]/20 hover:bg-[#1468F5]/5 transition text-center group"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition"
            style={{ backgroundColor: t.color + '10' }}
          >
            <t.icon className="w-5 h-5" style={{ color: t.color }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{t.label}</div>
            <div className="text-[10px] text-slate-400">{t.desc}</div>
          </div>
        </button>
      ))}
    </div>
  </div>
  );
};