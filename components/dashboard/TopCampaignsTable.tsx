'use client';

import React from 'react';
import { CampaignData } from '@/lib/types';

const campaigns: CampaignData[] = [
  { id: '1', name: 'Suzuki Engine Promo Q3', status: 'Published', timeAgo: '3d ago', image: '⚓', channels: ['instagram', 'facebook'], reach: '2,340', engagement: '14.2%', conversions: '28', convChange: '+12%' },
  { id: '2', name: 'CCTV Installation Flash Sale', status: 'Published', timeAgo: '1w ago', image: '📹', channels: ['instagram', 'facebook', 'tiktok'], reach: '4,120', engagement: '18.7%', conversions: '45', convChange: '+22%' },
  { id: '3', name: 'Solar System Consultation', status: 'Draft', timeAgo: '', image: '☀️', channels: ['facebook'], reach: '—', engagement: '—', conversions: '—' },
  { id: '4', name: 'Hikvision Smart Lock Launch', status: 'Scheduled', timeAgo: 'Launching tomorrow', image: '🔐', channels: ['instagram', 'facebook', 'twitter'], reach: '—', engagement: '—', conversions: '—' },
];

const statusColors: Record<string, string> = {
  Published: 'bg-[#10B981]/10 text-[#10B981]',
  Draft: 'bg-slate-100 text-slate-500',
  Scheduled: 'bg-[#1468F5]/10 text-[#1468F5]',
  Ended: 'bg-[#EF233C]/10 text-[#EF233C]',
};

const channelLogos: Record<string, string> = { instagram: '📸', facebook: '👤', tiktok: '🎵', twitter: '🐦' };

export const TopCampaignsTable: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-base font-bold text-slate-900">Top Campaigns</h3>
      <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
    </div>
    <div className="space-y-3">
      {campaigns.map((c) => (
        <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">{c.image}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 truncate">{c.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>{c.status}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {c.channels.map((ch) => (
                <span key={ch} className="text-xs">{channelLogos[ch]}</span>
              ))}
              {c.timeAgo && <span className="text-[10px] text-slate-400">{c.timeAgo}</span>}
            </div>
          </div>
          {c.status === 'Published' && (
            <div className="hidden sm:flex items-center gap-6 text-xs text-slate-500">
              <div className="text-center"><div className="font-bold text-slate-900">{c.reach}</div><div>Reach</div></div>
              <div className="text-center"><div className="font-bold text-slate-900">{c.engagement}</div><div>Engagement</div></div>
              <div className="text-center"><div className="font-bold text-slate-900">{c.conversions}</div><div>Conv</div></div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);
