'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Copy, Check } from 'lucide-react';

export const AiCommandCenter: React.FC = () => {
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
      setResult(`WhatsApp Broadcast Message for Roshanal Infotech:

⚓ **Suzuki 100HP Outboard Engine — IN STOCK NOW!**

Looking for a reliable outboard engine for your boat? We have genuine Suzuki 100HP engines available for immediate delivery in Port Harcourt.

✅ 2-Year Warranty
✅ Free Installation Consultation
✅ Competitive Price: ₦450,000

📞 Call: 08109522432
💬 WhatsApp: 08033170802
📍 No 18A Rumuola Road, Port Harcourt

Limited stock — order before they run out!

#SuzukiEngine #MarineEquipment #PortHarcourt #BoatEngine`);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">AI Command Center</h3>
          <p className="text-xs text-slate-400">Generate content, campaigns, and automations with AI</p>
        </div>
      </div>

      <div className="relative mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI to create a WhatsApp broadcast for Suzuki engines..."
          className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {result && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-400">AI Generated</span>
            <button onClick={handleCopy} className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1">
              {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{result}</pre>
        </div>
      )}
    </div>
  );
};
