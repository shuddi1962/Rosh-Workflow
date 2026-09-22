'use client';

import React from 'react';
import { Anchor, ShieldCheck, ShoppingBag, Briefcase, Factory, GraduationCap } from 'lucide-react';

const industries = [
  { icon: ShieldCheck, name: 'Retail & E-commerce', desc: 'WhatsApp catalogs, abandoned cart recovery, VIP client concierge automation.', tag: 'Popular' },
  { icon: Anchor, name: 'Healthcare', desc: 'Appointment booking, patient communication, and lab result dispatch automation.', tag: 'Growing' },
  { icon: Briefcase, name: 'Real Estate', desc: 'Diaspora investor outreach, property listing automation, and lead qualification.', tag: 'Growth' },
  { icon: Factory, name: 'Education', desc: 'School enrollment funnels, parent communication automation, event marketing.', tag: 'New' },
  { icon: GraduationCap, name: 'Manufacturing', desc: 'Bulk order processing, supplier outreach, and inventory-based auto-quoting.', tag: 'Enterprise' },
  { icon: ShoppingBag, name: 'Professional Services', desc: 'Law firms, accounting, consulting — appointment booking and client nurture.', tag: 'Popular' },
];

export const IndustriesSection: React.FC = () => (
  <section id="industries" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1833] mb-4">Built for Every Industry</h2>
        <p className="text-lg text-slate-600">GrowPilot adapts its AI, automations, and dashboards to your specific business model.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map((ind) => (
          <div key={ind.name} className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-[#1468F5]/30 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#1468F5]/5 flex items-center justify-center text-[#1468F5] group-hover:scale-110 transition">
                <ind.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#1468F5]/10 text-[#1468F5]">{ind.tag}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{ind.name}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{ind.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);