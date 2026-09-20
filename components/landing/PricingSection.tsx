'use client';

import React from 'react';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '₦49,000',
    period: '/month',
    desc: 'For small businesses getting started with automation',
    features: ['3 Automation Routines', 'WhatsApp Auto-responder', 'Basic Analytics', '1 User Seat', 'Email Support'],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₦149,000',
    period: '/month',
    desc: 'For growing businesses scaling their operations',
    features: ['10 Automation Routines', 'Multi-channel Campaigns', 'CRM Pipeline', 'Competitor Spy', '3 User Seats', 'Priority Support', 'AI Content Engine'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '₦449,000',
    period: '/month',
    desc: 'For businesses that need full AI power',
    features: ['Unlimited Automations', 'Voice AI Agents', 'Full Analytics Suite', 'Unlimited Users', 'Custom Integrations', 'Dedicated Account Manager', 'API Access', 'White-label Option'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export const PricingSection: React.FC = () => (
  <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
        <p className="text-lg text-slate-600">No hidden fees. No contracts. Cancel anytime.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {plans.map((p) => (
          <div key={p.name} className={`rounded-2xl border p-8 ${p.highlighted ? 'border-blue-500 shadow-2xl shadow-blue-500/10 bg-white relative' : 'border-slate-200 bg-white'}`}>
            {p.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>}
            <h3 className="text-xl font-bold text-slate-900 mb-2">{p.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-slate-900">{p.price}</span>
              <span className="text-sm text-slate-500">{p.period}</span>
            </div>
            <p className="text-sm text-slate-600 mb-6">{p.desc}</p>
            <ul className="space-y-3 mb-8">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-xl text-sm font-bold transition ${p.highlighted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);
