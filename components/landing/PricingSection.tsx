'use client';

import React from 'react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '₦29,000',
    period: '/month',
    desc: 'For small businesses getting started with automation',
    features: ['Up to 3 team members', 'Basic AI automations', '1,000 leads/month', 'Email support'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '₦99,000',
    period: '/month',
    desc: 'For growing businesses scaling their operations',
    features: ['Up to 10 team members', 'Advanced AI features', '10,000 leads/month', 'Priority support'],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '₦189,000',
    period: '/month',
    desc: 'For larger teams and organizations',
    features: ['Up to 50 team members', 'Full AI suite', '50,000 leads/month', 'Dedicated account manager'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For enterprises with custom needs',
    features: ['Unlimited team members', 'Custom integrations', 'Dedicated cloud & security', 'SLA & premium support'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export const PricingSection: React.FC = () => (
  <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1833] mb-4">Flexible Plans for Every Stage of Growth</h2>
        <p className="text-lg text-slate-600">Choose the plan that fits your business. Upgrade or downgrade anytime.</p>
        <div className="flex items-center justify-center gap-3 mt-6 text-sm">
          <span className="px-4 py-2 rounded-xl bg-[#0A1833] text-white font-semibold">Monthly</span>
          <span className="px-4 py-2 rounded-xl text-slate-400 font-medium">Yearly <span className="text-[#10B981] text-xs">Save 20%</span></span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((p) => (
          <div key={p.name} className={`rounded-2xl border p-8 flex flex-col ${p.highlighted ? 'border-[#1468F5] shadow-2xl shadow-blue-500/10 bg-white relative' : 'border-slate-200 bg-white'}`}>
            {p.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1468F5] text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>}
            <h3 className="text-xl font-bold text-slate-900 mb-2">{p.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-slate-900">{p.price}</span>
              <span className="text-sm text-slate-500">{p.period}</span>
            </div>
            <p className="text-sm text-slate-600 mb-6">{p.desc}</p>
            <ul className="space-y-3 mb-8 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-xl text-sm font-bold transition ${p.highlighted ? 'bg-[#1468F5] text-white hover:bg-[#1257D0]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);