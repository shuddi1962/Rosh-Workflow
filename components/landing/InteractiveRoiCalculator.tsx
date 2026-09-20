'use client';

import React, { useState } from 'react';
import { Calculator, DollarSign, Users, TrendingUp, ArrowRight } from 'lucide-react';

export const InteractiveRoiCalculator: React.FC = () => {
  const [leads, setLeads] = useState(200);
  const [conversion, setConversion] = useState(12);
  const [avgOrder, setAvgOrder] = useState(85000);
  const [automationBoost, setAutomationBoost] = useState(35);

  const baselineRevenue = leads * (conversion / 100) * avgOrder;
  const boostedRevenue = leads * ((conversion + automationBoost * 0.3) / 100) * avgOrder * 1.15;
  const monthlyLift = boostedRevenue - baselineRevenue;
  const annualLift = monthlyLift * 12;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Calculate Your ROI</h2>
          <p className="text-lg text-slate-300">See how much revenue ROSH AI can unlock for your business</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Monthly Leads: {leads.toLocaleString()}</label>
              <input type="range" min={50} max={2000} step={50} value={leads} onChange={(e) => setLeads(+e.target.value)} className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Current Conversion Rate: {conversion}%</label>
              <input type="range" min={1} max={30} step={1} value={conversion} onChange={(e) => setConversion(+e.target.value)} className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Average Order Value: ₦{avgOrder.toLocaleString()}</label>
              <input type="range" min={5000} max={500000} step={5000} value={avgOrder} onChange={(e) => setAvgOrder(+e.target.value)} className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Automation Conversion Boost: {automationBoost}%</label>
              <input type="range" min={5} max={60} step={5} value={automationBoost} onChange={(e) => setAutomationBoost(+e.target.value)} className="w-full accent-blue-500" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
            <h3 className="text-xl font-bold text-white mb-6">Projected Revenue Lift</h3>
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <p className="text-sm text-slate-400 mb-1">Baseline Monthly Revenue</p>
                <p className="text-3xl font-bold text-slate-300">₦{Math.round(baselineRevenue).toLocaleString()}</p>
              </div>
              <div className="bg-blue-500/10 rounded-2xl p-5 border border-blue-500/20">
                <p className="text-sm text-blue-300 mb-1">With ROSH AI</p>
                <p className="text-3xl font-bold text-blue-400">₦{Math.round(boostedRevenue).toLocaleString()}</p>
              </div>
              <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20">
                <p className="text-sm text-emerald-300 mb-1">Monthly Additional Revenue</p>
                <p className="text-3xl font-bold text-emerald-400">+₦{Math.round(monthlyLift).toLocaleString()}</p>
              </div>
              <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20">
                <p className="text-sm text-amber-300 mb-1">Projected Annual Lift</p>
                <p className="text-3xl font-bold text-amber-400">₦{Math.round(annualLift).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
