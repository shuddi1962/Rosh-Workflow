'use client';

import React from 'react';
import { UserPlus, Settings, Rocket, Sparkles } from 'lucide-react';

const steps = [
  { icon: UserPlus, num: '01', title: 'Create your account', desc: 'Sign up in seconds and set up your business profile.' },
  { icon: Settings, num: '02', title: 'Set up your workspace', desc: 'Connect your channels, import products, and invite your team.' },
  { icon: Rocket, num: '03', title: 'Let AI do the work', desc: 'AI handles marketing, leads, campaigns, and analytics automatically.' },
];

export const ProcessSection: React.FC = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F9FD]">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1833] mb-4">Get Started in 3 Simple Steps</h2>
        <p className="text-lg text-slate-600">No developers. No complexity. Just results.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {steps.map((s) => (
          <div key={s.num} className="text-center">
            <div className="text-5xl font-black text-slate-100 mb-4">{s.num}</div>
            <div className="w-14 h-14 bg-[#1468F5] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 mx-auto">
              <s.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);