'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { ArrowRight, Play, Zap, Shield, TrendingUp } from 'lucide-react';

interface Props {
  onOpenDashboard: () => void;
  onOpenRegisterModal: () => void;
}

export const HeroSection: React.FC<Props> = ({ onOpenDashboard, onOpenRegisterModal }) => {
  const { currentTenant, formatCurrency } = useTenant();

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Business Automation
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Your Business on{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Autopilot
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            ROSH AI connects your CRM, WhatsApp, email, and social channels into one intelligent engine that qualifies leads, runs campaigns, and closes deals — while you sleep.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button onClick={onOpenRegisterModal} className="px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2">
              Launch Your AI Engine
              <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={onOpenDashboard} className="px-8 py-4 rounded-2xl text-base font-semibold bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Play className="w-4 h-4" />
              See Live Demo
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">2,340+</div>
              <div className="text-sm text-slate-500">Leads Qualified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">98.7%</div>
              <div className="text-sm text-slate-500">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">15s</div>
              <div className="text-sm text-slate-500">Response Time</div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-slate-400 font-mono">rosh-ai-dashboard</span>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 font-mono text-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <Shield className="w-4 h-4" />
              <span>WhatsApp inquiry detected: &quot;Do you have Suzuki 100HP in stock?&quot;</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Zap className="w-4 h-4" />
              <span>AI qualifying lead... Checking inventory, pricing, and location...</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
              <span>Response sent: Product specs + ₦450,000 quote + installation offer in 12s</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
