'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Play, Pause, MessageSquare, Send as SendIcon, Mail, CheckCircle2, Zap } from 'lucide-react';

export const ActiveAutomationsPanel: React.FC = () => {
  const { currentTenant, toggleAutomation } = useTenant();
  const channelIcons: Record<string, React.ReactNode> = {
    whatsapp: <MessageSquare className="w-3.5 h-3.5" />,
    email: <Mail className="w-3.5 h-3.5" />,
    sms: <SendIcon className="w-3.5 h-3.5" />,
    meta: <SendIcon className="w-3.5 h-3.5" />,
    crm: <CheckCircle2 className="w-3.5 h-3.5" />,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-slate-900">Active Automations</h3>
        <span className="text-xs text-slate-400">{currentTenant.automations.filter((a) => a.active).length} running</span>
      </div>
      <div className="space-y-3">
        {currentTenant.automations.map((a) => (
          <div key={a.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition group">
            <div className="text-blue-600">{channelIcons[a.channel]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{a.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">{a.executionsToday} runs · {a.lastExecution} · {a.successRate}</div>
            </div>
            <button onClick={() => toggleAutomation(a.id)} className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${a.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 ${a.active ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
