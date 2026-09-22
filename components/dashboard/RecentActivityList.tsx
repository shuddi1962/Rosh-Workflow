'use client';

import React from 'react';
import { ActivityItem } from '@/lib/types';
import { UserPlus, TrendingUp, Eye, ShoppingCart, UserCheck, Bell } from 'lucide-react';

const activities: ActivityItem[] = [
  { id: '1', title: 'New lead from LinkedIn', subtitle: 'Acme Security Ltd · 2m ago', time: '2m ago', badge: { label: 'New', variant: 'new' }, iconType: 'lead' },
  { id: '2', title: 'Campaign performance improved', subtitle: '+24% engagement · 12m ago', time: '12m ago', badge: { label: 'Success', variant: 'success' }, iconType: 'performance' },
  { id: '3', title: 'Competitor detected', subtitle: 'Hikvision launched new camera · 25m ago', time: '25m ago', badge: { label: 'Alert', variant: 'alert' }, iconType: 'competitor' },
  { id: '4', title: 'Order received', subtitle: '₦250,000 · 47m ago', time: '47m ago', badge: { label: 'Order', variant: 'order' }, iconType: 'order' },
  { id: '5', title: 'New customer registered', subtitle: 'Sunrise Trading Co. · 1h ago', time: '1h ago', badge: { label: 'Success', variant: 'success' }, iconType: 'user' },
];

const iconMap: Record<string, React.ReactNode> = {
  lead: <UserPlus className="w-4 h-4" />,
  performance: <TrendingUp className="w-4 h-4" />,
  competitor: <Eye className="w-4 h-4" />,
  order: <ShoppingCart className="w-4 h-4" />,
  user: <UserCheck className="w-4 h-4" />,
};

const badgeColors: Record<string, string> = {
  new: 'bg-[#1468F5]/10 text-[#1468F5]',
  success: 'bg-[#10B981]/10 text-[#10B981]',
  alert: 'bg-[#F59E0B]/10 text-[#F59E0B]',
  order: 'bg-[#1468F5]/10 text-[#1468F5]',
};

export const RecentActivityList: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
      <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
    </div>
    <div className="space-y-4">
      {activities.map((a) => (
        <div key={a.id} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
            {iconMap[a.iconType]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{a.title}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColors[a.badge.variant]}`}>{a.badge.label}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{a.subtitle}</div>
          </div>
          <span className="text-[10px] text-slate-400 flex-shrink-0">{a.time}</span>
        </div>
      ))}
    </div>
  </div>
);