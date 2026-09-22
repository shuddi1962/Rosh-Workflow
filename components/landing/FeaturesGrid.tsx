'use client';

import React from 'react';
import { Megaphone, Users, ShoppingCart, PenLine, Zap, BarChart3, Settings, Target } from 'lucide-react';

const features = [
  { icon: Megaphone, title: 'Marketing', desc: 'Multi-channel campaigns across WhatsApp, email, and social media.', color: '#1468F5' },
  { icon: Users, title: 'Sales & CRM', desc: 'AI-scored leads, pipeline management, and deal tracking.', color: '#1468F5' },
  { icon: ShoppingCart, title: 'Commerce', desc: 'Product catalog, order management, and payment tracking.', color: '#10B981' },
  { icon: PenLine, title: 'Content Studio', desc: 'AI-generated text, images, videos, and UGC ad creatives.', color: '#EF233C' },
  { icon: Zap, title: 'Automation', desc: 'Set-and-forget workflows that run your business 24/7.', color: '#1468F5' },
  { icon: BarChart3, title: 'Analytics & Insights', desc: 'Real-time dashboards, reports, and business intelligence.', color: '#1468F5' },
  { icon: Settings, title: 'Integrations', desc: 'Connect WhatsApp, Meta, Google, and 50+ platforms.', color: '#10B981' },
  { icon: Target, title: 'UGC Creator', desc: 'Generate user-generated content ads that convert.', color: '#EF233C' },
];

export const FeaturesGrid: React.FC = () => (
  <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1833] mb-4">Everything You Need to Grow, in One Place</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">One platform replacing 12+ tools. AI handles the heavy lifting while you focus on growth.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <div key={f.title} className="group p-6 rounded-2xl border border-slate-100 hover:border-[#1468F5]/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 bg-white">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition" style={{ backgroundColor: f.color + '10' }}>
              <f.icon className="w-6 h-6" style={{ color: f.color }} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);