'use client';

import React from 'react';
import { MessageSquare, Mail, Send, Globe, BarChart3, Zap } from 'lucide-react';

const tools = [
  { icon: MessageSquare, label: 'WhatsApp Broadcast', desc: 'Send bulk messages', color: 'bg-green-50 text-green-600' },
  { icon: Mail, label: 'Email Campaign', desc: 'Send email blast', color: 'bg-blue-50 text-blue-600' },
  { icon: Send, label: 'SMS Blast', desc: 'Bulk SMS outreach', color: 'bg-purple-50 text-purple-600' },
  { icon: Globe, label: 'Social Post', desc: 'Schedule a post', color: 'bg-cyan-50 text-cyan-600' },
  { icon: BarChart3, label: 'Competitor Scan', desc: 'Analyze competitors', color: 'bg-orange-50 text-orange-600' },
  { icon: Zap, label: 'AI Content', desc: 'Generate content', color: 'bg-indigo-50 text-indigo-600' },
];

export const QuickToolsGrid: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6">
    <h3 className="text-base font-bold text-slate-900 mb-5">Quick Actions</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {tools.map((t) => (
        <button key={t.label} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition text-center group">
          <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center group-hover:scale-110 transition`}>
            <t.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{t.label}</div>
            <div className="text-[10px] text-slate-400">{t.desc}</div>
          </div>
        </button>
      ))}
    </div>
  </div>
);
