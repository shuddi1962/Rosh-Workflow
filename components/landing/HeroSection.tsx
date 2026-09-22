'use client';

import React from 'react';
import { ArrowRight, Play, Check } from 'lucide-react';
import { useTenant } from '@/lib/context/TenantContext';
import { TrendingUp, Zap, Shield, Users, BarChart3, Send, ArrowUpRight } from 'lucide-react';

interface Props {
  onOpenDashboard: () => void;
  onOpenRegisterModal: () => void;
}

export const HeroSection: React.FC<Props> = ({ onOpenDashboard, onOpenRegisterModal }) => {
  const { currentTenant, formatCurrency } = useTenant();

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-white">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#1468F5]/5 to-transparent rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#EF233C]/5 to-transparent rounded-full blur-3xl opacity-40" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1468F5]/5 border border-[#1468F5]/10 text-[#1468F5] text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              AI-POWERED BUSINESS OPERATING SYSTEM
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 text-[#0A1833]">
              More Leads.
              <br />
              More Sales.
              <span className="text-[#EF233C]"> Less Work.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-lg mb-8 leading-relaxed">
              ROSH is the all-in-one platform that helps businesses attract customers, manage sales, automate marketing, and grow — with the power of AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
              <button onClick={onOpenRegisterModal} className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-base font-bold bg-[#1468F5] text-white hover:shadow-xl hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={onOpenDashboard} className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-base font-semibold bg-white text-slate-700 border border-slate-200 hover:border-slate-300 transition flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              {['No credit card required', 'Setup in minutes', 'Cancel anytime'].map((check) => (
                <div key={check} className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Check className="w-4 h-4 text-[#10B981]" />
                  {check}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1468F5]/10 to-[#EF233C]/5 rounded-3xl blur-2xl transform -rotate-3 scale-105" />
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden transform rotate-1 hover:rotate-0 transition duration-500 relative z-10">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-auto text-xs text-slate-400 font-mono">rosh-dashboard</span>
              </div>
              <div className="p-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(currentTenant.monthlyRevenue)}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold">
                    <ArrowUpRight className="w-3 h-3" />
                    +{currentTenant.revenueGrowth}%
                  </div>
                </div>
                <svg viewBox="0 0 300 100" className="w-full h-24 mb-4">
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1468F5" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#1468F5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 Q30,70 60,65 T120,50 T180,45 T240,30 T300,15" fill="none" stroke="#1468F5" strokeWidth="2.5" />
                  <path d="M0,80 Q30,70 60,65 T120,50 T180,45 T240,30 T300,15 L300,100 L0,100 Z" fill="url(#heroGrad)" />
                </svg>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500">Leads</p>
                    <p className="font-bold text-slate-900">{currentTenant.totalLeads.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500">CR</p>
                    <p className="font-bold text-slate-900">{currentTenant.conversionRate}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500">Campaigns</p>
                    <p className="font-bold text-slate-900">{currentTenant.activeCampaignsCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};