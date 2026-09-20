'use client';

import React from 'react';
import { Upload, Zap, BarChart3, Rocket } from 'lucide-react';

const steps = [
  { icon: Upload, num: '01', title: 'Connect Your Channels', desc: 'Link WhatsApp, email, social accounts, and CRM in one click.' },
  { icon: Zap, num: '02', title: 'Configure AI Routines', desc: 'Set up auto-responders, lead qualification, and campaign triggers.' },
  { icon: BarChart3, num: '03', title: 'AI Learns Your Business', desc: 'Feed product catalog, pricing, and brand voice — AI handles the rest.' },
  { icon: Rocket, num: '04', title: 'Watch Revenue Grow', desc: 'Automations run 24/7. Leads convert. Campaigns launch. You scale.' },
];

export const ProcessSection: React.FC = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Up and Running in 15 Minutes</h2>
        <p className="text-lg text-slate-600">No developers. No complexity. Just results.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((s) => (
          <div key={s.num} className="relative">
            <div className="text-6xl font-black text-slate-100 mb-4">{s.num}</div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
