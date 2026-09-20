'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { DollarSign, Users, TrendingUp, ShoppingCart, Send, Target } from 'lucide-react';
import { MetricCardData } from '@/lib/types';

export const MetricCards: React.FC = () => {
  const { currentTenant, formatCurrency } = useTenant();

  const metrics: MetricCardData[] = [
    {
      title: 'Monthly Revenue',
      value: formatCurrency(currentTenant.monthlyRevenue),
      change: `+${currentTenant.revenueGrowth}% vs last month`,
      isPositive: true,
      period: 'vs last month',
      iconName: 'dollar',
      iconBgColor: 'bg-emerald-50 text-emerald-600',
      sparklineData: (currentTenant.revenueHistory || []).map((r) => r.current),
    },
    {
      title: 'Total Leads',
      value: currentTenant.totalLeads.toLocaleString(),
      change: `+${currentTenant.leadsGrowth}% new leads`,
      isPositive: true,
      period: 'vs last month',
      iconName: 'users',
      iconBgColor: 'bg-blue-50 text-blue-600',
      sparklineData: [180, 220, 260, 310, 380, 420, 460],
    },
    {
      title: 'Conversion Rate',
      value: `${currentTenant.conversionRate}%`,
      change: `+${currentTenant.conversionGrowth}% improvement`,
      isPositive: true,
      period: 'vs last month',
      iconName: 'trending',
      iconBgColor: 'bg-indigo-50 text-indigo-600',
      sparklineData: [8.2, 9.1, 9.8, 10.4, 11.2, 11.9, 12.4],
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(currentTenant.avgOrderValue),
      change: '+8.2% increase',
      isPositive: true,
      period: 'vs last month',
      iconName: 'cart',
      iconBgColor: 'bg-amber-50 text-amber-600',
      sparklineData: [320, 340, 360, 390, 410, 430, 450],
    },
    {
      title: 'Active Campaigns',
      value: currentTenant.activeCampaignsCount.toString(),
      change: '3 launching this week',
      isPositive: true,
      period: 'active now',
      iconName: 'send',
      iconBgColor: 'bg-rose-50 text-rose-600',
      sparklineData: [2, 3, 4, 5, 6, 7, 8],
    },
    {
      title: 'New Customers',
      value: currentTenant.newCustomersCount.toString(),
      change: '+34% this month',
      isPositive: true,
      period: 'this month',
      iconName: 'target',
      iconBgColor: 'bg-purple-50 text-purple-600',
      sparklineData: [120, 135, 148, 160, 172, 180, 186],
    },
  ];

  const iconMap: Record<string, React.ReactNode> = {
    dollar: <DollarSign className="w-5 h-5" />,
    users: <Users className="w-5 h-5" />,
    trending: <TrendingUp className="w-5 h-5" />,
    cart: <ShoppingCart className="w-5 h-5" />,
    send: <Send className="w-5 h-5" />,
    target: <Target className="w-5 h-5" />,
  };

  const maxSpark = (data: number[]) => Math.max(...data);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((m) => {
        const sparkMax = maxSpark(m.sparklineData);
        return (
          <div key={m.title} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${m.iconBgColor} flex items-center justify-center group-hover:scale-110 transition`}>
                {iconMap[m.iconName]}
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{m.change.split(' ')[0]}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{m.value}</div>
            <div className="text-xs text-slate-500 mb-3">{m.title}</div>
            {m.sparklineData.length > 0 && (
              <div className="flex items-end gap-px h-6">
                {m.sparklineData.map((v, i) => (
                  <div key={i} className="flex-1 bg-blue-100 rounded-t" style={{ height: `${(v / sparkMax) * 100}%` }} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
