'use client';

import React from 'react';
import { Anchor, ShieldCheck, ShoppingBag, Briefcase, Factory, GraduationCap } from 'lucide-react';

const industries = [
  { icon: Anchor, name: 'Marine & Oil Gas', desc: 'Outboard engines, safety equipment, compliance tools for Niger Delta operators.', tag: 'Flagship' },
  { icon: ShieldCheck, name: 'Security & Surveillance', desc: 'CCTV, smart locks, access control — automated lead capture and installation booking.', tag: 'Growth' },
  { icon: ShoppingBag, name: 'Retail & Fashion', desc: 'WhatsApp catalogs, abandoned cart recovery, VIP client concierge automation.', tag: 'Popular' },
  { icon: Briefcase, name: 'Professional Services', desc: 'Law firms, accounting, consulting — appointment booking and client nurture sequences.', tag: 'New' },
  { icon: Factory, name: 'Manufacturing', desc: 'Bulk order processing, supplier outreach, and inventory-based auto-quoting.', tag: 'Enterprise' },
  { icon: GraduationCap, name: 'Education', desc: 'School enrollment funnels, parent communication automation, event marketing.', tag: 'Growing' },
];

export const IndustriesSection: React.FC = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">One Platform, Every Industry</h2>
        <p className="text-lg text-slate-600">Rosh AI adapts its AI, automations, and dashboards to your specific business model.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map((ind) => (
          <div key={ind.name} className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition">
                <ind.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600">{ind.tag}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{ind.name}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{ind.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
