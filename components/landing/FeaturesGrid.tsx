'use client';

import React from 'react';
import { Brain, MessageSquare, BarChart3, Shield, Zap, Users, Globe, Send, Bot } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Content Engine', desc: 'Generate social posts, emails, and ad copy tailored to your industry in seconds.', color: 'bg-purple-50 text-purple-600' },
  { icon: MessageSquare, title: 'WhatsApp Automation', desc: 'Instant auto-replies, lead qualification, and broadcast campaigns via WhatsApp Business API.', color: 'bg-green-50 text-green-600' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Track revenue, leads, and campaign performance across all channels in real-time.', color: 'bg-blue-50 text-blue-600' },
  { icon: Shield, title: 'Competitor Spy', desc: 'Monitor competitor pricing, ads, and content strategies automatically.', color: 'bg-orange-50 text-orange-600' },
  { icon: Users, title: 'CRM Pipeline', desc: 'AI-scored leads with automatic stage progression and next-action recommendations.', color: 'bg-indigo-50 text-indigo-600' },
  { icon: Send, title: 'Multi-Channel Campaigns', desc: 'Launch WhatsApp, email, and SMS campaigns from a single dashboard.', color: 'bg-rose-50 text-rose-600' },
  { icon: Globe, title: 'Social Scheduler', desc: 'Auto-post to Instagram, Facebook, LinkedIn, and TikTok with AI-optimized timing.', color: 'bg-cyan-50 text-cyan-600' },
  { icon: Bot, title: 'Voice AI Agents', desc: 'Deploy ElevenLabs-powered voice agents for inbound and outbound calls.', color: 'bg-amber-50 text-amber-600' },
  { icon: Zap, title: 'Instant Lead Response', desc: 'Respond to inquiries in under 15 seconds across all channels, 24/7.', color: 'bg-emerald-50 text-emerald-600' },
];

export const FeaturesGrid: React.FC = () => (
  <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Everything Your Business Needs</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">One platform replacing 12+ tools. AI handles the heavy lifting while you focus on growth.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="group p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 bg-white">
            <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
