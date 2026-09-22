'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const sources = [
  { label: 'WhatsApp Inbound', value: 38, color: '#10B981' },
  { label: 'Website', value: 24, color: '#1468F5' },
  { label: 'Paid Ads', value: 18, color: '#EF233C' },
  { label: 'Referrals', value: 12, color: '#F59E0B' },
  { label: 'Email', value: 8, color: '#EF233C' },
];

export const LeadsBySourceChart: React.FC = () => {
  const { currentTenant } = useTenant();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-base font-bold text-slate-900 mb-5">Leads by Source</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={sources}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            labelLine={false}
            label={({ name, value, percent }) => (
              <text
                x={0}
                y={4}
                dy={12}
                fill="#0F172A"
                textAnchor="middle"
                fontSize={12}
                fontWeight={500}
              >
                {name}
              </text>
            )}
          >
            {sources.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value}%`}
            labelFormatter={(_) => 'Percentage'}
          />
          <Legend
            verticalAlign="top"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center items-center space-x-2 mt-4 text-slate-600 text-sm">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>WhatsApp Inbound: 38%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-[#1468F5]" />
          <span>Website: 24%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-[#EF233C]" />
          <span>Paid Ads: 18%</span>
        </div>
      </div>
    </div>
  );
};