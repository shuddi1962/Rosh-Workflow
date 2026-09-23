'use client';

import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Emeka Okoro', role: 'CEO, Roshanal Infotech', text: 'GrowPilot auto-responds to WhatsApp inquiries in 12 seconds. Our lead conversion jumped 40% in the first month. The competitor spy feature alone paid for the entire platform.', stars: 5 },
  { name: 'Dr. Tunde Alabi', role: 'Founder, Beacon Health', text: 'We automated our corporate retainer outreach and lab result dispatch. Staff saves 20+ hours/week and patients get results faster. ROI was visible within two weeks.', stars: 5 },
  { name: 'Elena Rostova', role: 'Owner, Aurora Silk & Couture', text: 'The Instagram DM auto-responder is magic. Comment "LUXE" on any reel and customers get a personalized lookbook instantly. Sales up 35% since launch.', stars: 5 },
];

export const TestimonialsSection: React.FC = () => (
    <section id="resources" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F9FD]">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1833] mb-4">Real Businesses. Real Results.</h2>
        <p className="text-lg text-slate-600">See how businesses like yours are growing with GrowPilot.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: t.stars }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
            <div>
              <p className="font-bold text-slate-900 text-sm">{t.name}</p>
              <p className="text-xs text-slate-500">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);