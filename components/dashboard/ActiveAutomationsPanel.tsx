'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Pause, Play, Radio, Zap } from 'lucide-react';

export const ActiveAutomationsPanel: React.FC = () => {
  const { currentTenant, toggleAutomation } = useTenant();
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Active Automations</h3>
          <p className="text-xs text-slate-400">Background AI agents</p>
        </div>
        <span className="text-xs font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
          {currentTenant.automations.filter((a) => a.active).length} active
        </span>
      </div>
      <div className="space-y-3">
        {currentTenant.automations.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.active ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-slate-200 text-slate-400'}`}>
              {a.active ? <Radio className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
              <p className="text-[10px] text-slate-400">{a.executionsToday} runs today · {a.successRate} success</p>
            </div>
            <button
              onClick={() => toggleAutomation(a.id)}
              className={`text-[10px] px-2 py-1 rounded-full border ${
                a.active
                  ? 'border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10'
                  : 'border-slate-200 text-slate-400 hover:bg-slate-100'
              } transition`}
            >
              {a.active ? 'Pause' : 'Resume'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};