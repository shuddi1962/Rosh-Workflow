'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { DollarSign, Users, TrendingUp, ShoppingCart, Send, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data, 1);
  const w = 60, h = 20;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-5"><polyline points={points} fill="none" stroke={color} strokeWidth="1.5" /></svg>;
};

export const MetricCards: React.FC = () => {
  const { currentTenant, formatCurrency, activeFilterPeriod } = useTenant();

  const metrics = [
    { title: 'Total Revenue', value: formatCurrency(currentTenant.monthlyRevenue), change: `+${currentTenant.revenueGrowth}%`, isPositive: true, icon: DollarSign, color: '#1468F5', data: (currentTenant.revenueHistory || []).map((r) => r.current) },
    { title: 'Total Leads', value: currentTenant.totalLeads.toLocaleString(), change: `+${currentTenant.leadsGrowth}%`, isPositive: true, icon: Users, color: '#1468F5', data: [180, 220, 260, 310, 380, 420, 460] },
    { title: 'Conversion Rate', value: `${currentTenant.conversionRate}%`, change: `+${currentTenant.conversionGrowth}%`, isPositive: true, icon: TrendingUp, color: '#1468F5', data: [8.2, 9.1, 9.8, 10.4, 11.2, 11.9, 12.4] },
    { title: 'Active Campaigns', value: currentTenant.activeCampaignsCount.toString(), change: '+33.3%', isPositive: true, icon: Send, color: '#1468F5', data: [2, 3, 4, 5, 6, 7, 8] },
    { title: 'New Customers', value: currentTenant.newCustomersCount.toString(), change: '+21.7%', isPositive: true, icon: Target, color: '#1468F5', data: [120, 135, 148, 160, 172, 180, 186] },
    { title: 'Avg. Order Value', value: formatCurrency(currentTenant.avgOrderValue), change: '+9.4%', isPositive: true, icon: ShoppingCart, color: '#1468F5', data: [320, 340, 360, 390, 410, 430, 450] },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((m) => (
        <div key={m.title} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: m.color + '15' }}>
              <m.icon className="w-5 h-5" style={{ color: m.color }} />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
              {m.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {m.change}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">{m.value}</div>
          <div className="text-xs text-slate-500 mb-3">{m.title}</div>
          <Sparkline data={m.data} color={m.color} />
        </div>
      ))}
    </div>
  );
};