'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Sparkles, Send, Loader2, Copy, Check, Wand2, Users, Radar, PenLine, Target, ArrowRight } from 'lucide-react';

const actionCards = [
  { icon: Wand2, label: 'AI Campaign', desc: 'Omni-channel ads', color: '#1468F5', bg: 'bg-[#1468F5]/10' },
  { icon: Users, label: 'Find Leads', desc: 'AI prospector', color: '#10B981', bg: 'bg-[#10B981]/10' },
  { icon: Radar, label: 'Radar Spy', desc: 'Competitor intel', color: '#EF233C', bg: 'bg-[#EF233C]/10' },
  { icon: PenLine, label: 'AI Content', desc: 'Text, image, video', color: '#1468F5', bg: 'bg-[#1468F5]/10' },
];

export const AiCommandCenter: React.FC = () => {
  const { currentTenant } = useTenant();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    setTimeout(() => {
      setLoading(false);
      setResult(`AI action plan for ${currentTenant.name}:

1. Segment active leads by intent and location
2. Generate WhatsApp + email follow-up sequences
3. Launch targeted campaign across Instagram and Facebook
4. Track responses and auto-qualify new opportunities
5. Sync results to CRM pipeline in real-time`);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-[#1468F5] to-[#3B82F6] rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">AI Command Center</h3>
          <p className="text-xs text-slate-400">What would you like to do today?</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {actionCards.map((a) => (
          <button key={a.label} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 transition text-left">
            <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center`}>
              <a.icon className="w-4 h-4" style={{ color: a.color }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">{a.label}</p>
              <p className="text-[10px] text-slate-400">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="relative mb-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Ask me anything... e.g. Create a campaign for ${currentTenant.productsSummary}`}
          className="w-full h-20 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1468F5] resize-none"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-[#1468F5] text-white flex items-center justify-center hover:bg-[#1257D4] disabled:opacity-40 transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {['Find 50 leads', 'Analyze competitors', 'Create WhatsApp campaign', 'Generate report'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setPrompt(suggestion)}
            className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            {suggestion}
          </button>
        ))}
      </div>
      {result && (
        <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1468F5]">✦ AI Generated</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="text-xs text-slate-700 whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
};