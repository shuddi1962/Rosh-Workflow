'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const RevenueOverviewChart: React.FC = () => {
  const { currentTenant, activeFilterPeriod, setActiveFilterPeriod } = useTenant();
  const [period, setPeriod] = useState(activeFilterPeriod);

  const fullData = currentTenant.revenueHistory || [];
  const sliceCount: Record<typeof period, number> = { today: 1, '7d': 2, '30d': 4, ytd: 99 };
  const data = fullData.slice(-sliceCount[period]);

  const handlePeriod = (p: typeof period) => {
    setPeriod(p);
    setActiveFilterPeriod(p);
  };

  const chartData = data.map((d) => ({
    name: d.label,
    current: d.current,
    previous: d.previous,
  }));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
    return `₦${value}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Revenue Overview</h3>
          <p className="text-xs text-slate-500 mt-1">
            {formatCurrency(currentTenant.monthlyRevenue)} · +{currentTenant.revenueGrowth}% vs previous period
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {(['today', '7d', '30d', 'ytd'] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriod(p)}
              className={`px-2 py-1 text-[10px] font-semibold rounded-md transition ${
                period === p
                  ? 'bg-white shadow text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1468F5" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#1468F5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="previousGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), '']}
            labelStyle={{ color: '#0F172A', fontWeight: 600 }}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Area
            type="monotone"
            dataKey="previous"
            stroke="#94A3B8"
            strokeWidth={2}
            fill="url(#previousGradient)"
            name="Previous Period"
          />
          <Area
            type="monotone"
            dataKey="current"
            stroke="#1468F5"
            strokeWidth={2.5}
            fill="url(#currentGradient)"
            name="Current Period"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};