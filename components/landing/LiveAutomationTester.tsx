'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Play, Pause, CheckCircle2, MessageSquare, Send, Mail } from 'lucide-react';

export const LiveAutomationTester: React.FC = () => {
  const { currentTenant, toggleAutomation } = useTenant();
  const [selectedAuto, setSelectedAuto] = useState(0);
  const auto = currentTenant.automations[selectedAuto];

  const channelIcons: Record<string, React.ReactNode> = {
    whatsapp: <MessageSquare className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    sms: <Send className="w-4 h-4" />,
    meta: <Send className="w-4 h-4" />,
    crm: <CheckCircle2 className="w-4 h-4" />,
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Live Automation Sandbox</h2>
          <p className="text-lg text-slate-600">See how ROSH AI handles real customer interactions in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {currentTenant.automations.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setSelectedAuto(i)}
                className={`w-full text-left p-5 rounded-2xl border transition-all ${
                  selectedAuto === i
                    ? 'border-blue-200 bg-white shadow-lg shadow-blue-500/5'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-blue-600">{channelIcons[a.channel]}</div>
                    <span className="text-xs font-semibold text-blue-600 uppercase">{a.channel}</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${a.active ? 'bg-green-500' : 'bg-slate-300'}`} onClick={(e) => { e.stopPropagation(); toggleAutomation(a.id); }}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 ${a.active ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}`} />
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{a.title}</h4>
                <p className="text-sm text-slate-500 mb-3">{a.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{a.executionsToday} runs today</span>
                  <span>{a.lastExecution}</span>
                  <span className="text-emerald-600 font-semibold">{a.successRate}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${auto?.active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-sm font-semibold text-slate-700">{auto?.title}</span>
            </div>
            <div className="space-y-4 font-mono text-sm">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-slate-500 text-xs mb-1">Incoming Message</p>
                <p className="text-slate-800">&quot;Do you have Hikvision 4K cameras available for my office?&quot;</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-blue-500 text-xs mb-1">AI Processing (12s)</p>
                <p className="text-blue-800">Checking inventory → Matching product specs → Calculating installation → Formatting response</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-emerald-500 text-xs mb-1">Response Sent</p>
                <p className="text-emerald-800">Yes! We have Hikvision DS-2CD2T87G2P in stock. ₦185,000/unit with free installation in Port Harcourt. Shall I schedule a site survey?</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
              <span>Latency: 12.3s</span>
              <span>Confidence: 98.5%</span>
              <span className="text-emerald-600 font-semibold">Status: Delivered</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
