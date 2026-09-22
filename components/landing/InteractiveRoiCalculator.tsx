'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/context/TenantContext';

export const InteractiveRoiCalculator: React.FC = () => {
  const { formatCurrency } = useTenant();
  const [leads, setLeads] = useState(500);
  const [dealSize, setDealSize] = useState(150000);
  const [teamSize, setTeamSize] = useState(5);

  const extraRevenue = Math.round(leads * 0.18 * dealSize);
  const hoursSaved = Math.round(leads * 0.18 * 1.5);
  const roiMultiplier = (extraRevenue / Math.max(1, teamSize * 120000)).toFixed(1);

  return (
    <section id="roi" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1833] mb-4">Calculate Your ROI</h2>
          <p className="text-lg text-slate-600">See what autonomous AI could do for your business.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700">Monthly Inbound Leads: <span className="font-bold">{leads.toLocaleString()}</span></label>
                <input type="range" min="50" max="5000" step="50" value={leads} onChange={(e) => setLeads(Number(e.target.value))} className="w-full mt-2 accent-[#1468F5]" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Average Deal Size: <span className="font-bold">{formatCurrency(dealSize)}</span></label>
                <input type="range" min="10000" max="1000000" step="10000" value={dealSize} onChange={(e) => setDealSize(Number(e.target.value))} className="w-full mt-2 accent-[#1468F5]" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Sales Team Size: <span className="font-bold">{teamSize}</span></label>
                <input type="range" min="1" max="25" step="1" value={teamSize} onChange={(e) => setTeamSize(Number(e.target.value))} className="w-full mt-2 accent-[#1468F5]" />
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-[#1468F5] text-white rounded-2xl p-6">
              <p className="text-sm opacity-80 mb-2">Extra Revenue / Month</p>
              <p className="text-2xl font-bold">{formatCurrency(extraRevenue)}</p>
            </div>
            <div className="bg-[#10B981] text-white rounded-2xl p-6">
              <p className="text-sm opacity-80 mb-2">Hours Saved / Month</p>
              <p className="text-2xl font-bold">{hoursSaved.toLocaleString()}</p>
            </div>
            <div className="bg-[#EF233C] text-white rounded-2xl p-6">
              <p className="text-sm opacity-80 mb-2">ROI Multiplier</p>
              <p className="text-2xl font-bold">{roiMultiplier}x</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};