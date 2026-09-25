'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Sparkles, Send, ArrowRight, Loader2 } from 'lucide-react';

export const LiveAutomationTester: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const { currentTenant } = useTenant();

  const runDemo = () => {
    if (!prompt.trim()) return;
    setRunning(true);
    setEvents([]);
    const steps = [
      `Analyzing: "${prompt}"`,
      `Generating action plan for ${currentTenant.name}...`,
      'Creating campaign segments and messaging...',
      'Scheduling cross-platform deployment...',
      'Results ready — 47 leads targeted, est. ₦2.4M pipeline',
    ];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setEvents((prev) => [...prev, step]);
        if (i === steps.length - 1) setRunning(false);
      }, (i + 1) * 800);
    });
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1833] mb-4">Your AI Business Command Center</h2>
          <p className="text-lg text-slate-600">Tell Zorixza what you want to accomplish and let AI coordinate the work across your workspace.</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#1468F5] to-[#3B82F6] rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-900">AI Command Center</span>
            </div>
            <div className="relative mb-4">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Launch a new campaign for our CCTV products."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1468F5] pr-12"
                onKeyDown={(e) => e.key === 'Enter' && runDemo()}
              />
              <button
                onClick={runDemo}
                disabled={running || !prompt.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#1468F5] text-white flex items-center justify-center hover:bg-[#1257D4] disabled:opacity-40 transition"
              >
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Create campaign', 'Find leads', 'Analyze competitors', 'Generate content', 'Create report'].map((s) => (
                <button key={s} onClick={() => setPrompt(s)} className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition">
                  {s}
                </button>
              ))}
            </div>
            {events.length > 0 && (
              <div className="bg-slate-900 rounded-xl p-4 mt-4">
                <div className="space-y-2 font-mono text-sm">
                  {events.map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#1468F5]">{'>'}</span>
                      <span className="text-slate-300">{e}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};