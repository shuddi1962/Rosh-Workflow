'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/context/TenantContext';
import { Sparkles, Send, Loader2, Copy, Check, Wand2, Users, Radar, PenLine, AlertCircle, ArrowRight } from 'lucide-react';

const actionCards = [
  { icon: Wand2, label: 'AI Campaign', desc: 'Omni-channel ads', color: '#1468F5', bg: 'bg-[#1468F5]/10', href: '/dashboard/campaigns/create' },
  { icon: Users, label: 'Find Leads', desc: 'AI prospector', color: '#10B981', bg: 'bg-[#10B981]/10', href: '/dashboard/crm/leads' },
  { icon: Radar, label: 'Radar Spy', desc: 'Competitor intel', color: '#EF233C', bg: 'bg-[#EF233C]/10', href: '/dashboard/competitors' },
  { icon: PenLine, label: 'AI Content', desc: 'Text, image, video', color: '#1468F5', bg: 'bg-[#1468F5]/10', href: '/dashboard/content' },
];

const suggestions = [
  { label: 'Find 50 leads', href: '/dashboard/crm/leads' },
  { label: 'Analyze competitors', href: '/dashboard/competitors' },
  { label: 'Create WhatsApp campaign', href: '/dashboard/campaigns/create' },
  { label: 'Generate report', href: '/dashboard/analytics' },
];

interface AiResult {
  caption: string;
  hashtags: string[];
  cta: string;
  isLive: boolean;
}

function inferDivision(prompt: string): 'marine' | 'tech' {
  if (/solar|cctv|camera|hikvision|lock|tracker|surveillance|fire|alarm|inverter|battery|walkie|security/i.test(prompt)) return 'tech';
  return 'marine';
}

function inferPostType(prompt: string): string {
  if (/sale|offer|discount|promo|price|cost/i.test(prompt)) return 'Price Post';
  if (/\bvs\b|versus|compare|better/i.test(prompt)) return 'Comparison';
  if (/how|what|why|tip|guide|sign/i.test(prompt)) return 'Educational';
  return 'Problem-Solution';
}

export const AiCommandCenter: React.FC = () => {
  const { currentTenant } = useTenant();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    const text = prompt.trim();
    if (!text || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          division: inferDivision(text),
          post_type: inferPostType(text),
          platform: 'instagram',
          trend_id: null,
        }),
      });
      const data = (await res.json()) as {
        post?: { caption?: string; hashtags?: string[]; cta?: string };
        error?: string;
      };
      if (!res.ok || !data.post?.caption) {
        throw new Error(data.error || 'AI service is not available right now.');
      }
      setResult({
        caption: data.post.caption,
        hashtags: data.post.hashtags || [],
        cta: data.post.cta || 'Chat with us on WhatsApp today!',
        isLive: true,
      });
    } catch (err) {
      // Fallback: structured action plan built from live workspace data
      setResult({
        caption: `Action plan for ${currentTenant.name} — "${text}":\n\n1. Pull top leads from the CRM pipeline (${currentTenant.totalLeads.toLocaleString()} total)\n2. Draft WhatsApp + email follow-ups in the Content Brain\n3. Launch a targeted campaign across Instagram and Facebook\n4. Track replies and auto-qualify new opportunities\n\nNote: live AI drafting needs an OpenRouter key (Admin > API Keys).`,
        hashtags: [],
        cta: 'Open the Content Brain to create this campaign.',
        isLive: false,
      });
      setError(err instanceof Error ? err.message : '');
    } finally {
      setLoading(false);
    }
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
          <button
            key={a.label}
            onClick={() => router.push(a.href)}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-[#1468F5]/30 hover:bg-[#1468F5]/5 transition text-left"
          >
            <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center flex-shrink-0`}>
              <a.icon className="w-4 h-4" style={{ color: a.color }} />
            </div>
            <div className="min-w-0">
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleGenerate();
            }
          }}
          placeholder={`Ask AI... e.g. Promo post for ${currentTenant.productsSummary}`}
          className="w-full h-20 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1468F5] resize-none"
        />
        <button
          onClick={() => void handleGenerate()}
          disabled={loading || !prompt.trim()}
          aria-label="Ask AI"
          className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-[#1468F5] text-white flex items-center justify-center hover:bg-[#1257D4] disabled:opacity-40 transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => router.push(s.href)}
            className="text-[10px] px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-[#1468F5]/10 hover:text-[#1468F5] font-medium transition"
          >
            {s.label}
          </button>
        ))}
      </div>
      {result && (
        <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1468F5]">
              {result.isLive ? '✦ AI Generated' : '✦ Quick Plan (offline)'}
            </span>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(result.caption);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {error && (
            <p className="text-[11px] text-amber-600 flex items-center gap-1 mb-2">
              <AlertCircle className="w-3 h-3" /> {error}
            </p>
          )}
          <pre className="text-xs text-slate-700 whitespace-pre-wrap">{result.caption}</pre>
          {result.hashtags.length > 0 && (
            <p className="text-[11px] text-[#1468F5] mt-2 break-words">{result.hashtags.map((h) => `#${h}`).join(' ')}</p>
          )}
          <p className="text-[11px] font-semibold text-slate-800 mt-2">{result.cta}</p>
          <button
            onClick={() => router.push('/dashboard/content/ideas')}
            className="mt-3 text-xs font-semibold text-white bg-[#1468F5] hover:bg-[#1257D4] px-3 py-2 rounded-lg transition flex items-center gap-1"
          >
            Open in Content Brain <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
