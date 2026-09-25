'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export const ZorixzaChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hi! I\'m the Zorixza assistant. How can I help you today? I can answer questions about our products, pricing, or schedule a demo.' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Thanks for your message! A team member will be with you shortly. In the meantime, you can call us at 08109522432 or WhatsApp us for instant response.' }]);
    }, 1200);
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#1468F5] to-[#3B82F6] rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 hover:scale-110 transition">
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-[#1468F5] to-[#3B82F6] p-4">
            <h3 className="text-sm font-bold text-white">Zorixza Assistant</h3>
            <p className="text-xs text-blue-100">Usually replies instantly</p>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleSend} className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
