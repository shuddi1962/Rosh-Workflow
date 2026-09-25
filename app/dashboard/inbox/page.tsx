'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Inbox, Send, RefreshCw, Search, Plus, CheckCheck } from 'lucide-react';
import { PremiumPage, PremiumCard } from '@/components/dashboard/PremiumPage';
import { clsx } from 'clsx';

interface Conversation {
  id: string;
  phone: string;
  name: string;
  unread_count: number;
  last_message_at: string | null;
  last_preview: string;
}

interface Message {
  id: string;
  direction: string;
  body: string;
  status: string;
  created_at: string;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', headers: authHeaders(), ...init });
  if (res.status === 401) {
    // One silent refresh (expired 15-min JWT), then give up to login.
    const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    if (r.ok) {
      const retry = await fetch(path, { credentials: 'include', headers: authHeaders(), ...init });
      if (retry.ok) return (await retry.json()) as T;
    }
    throw new Error('SESSION');
  }
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(String(body.error || `Request failed (${res.status})`));
  return body as T;
}

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function InboxPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendWarning, setSendWarning] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newError, setNewError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const j = await api<{ conversations: Conversation[] }>('/api/whatsapp/conversations');
      setThreads(j.conversations ?? []);
      setError(null);
    } catch (e) {
      if (e instanceof Error && e.message === 'SESSION') {
        router.replace('/login');
        return;
      }
      if (!silent) setError(e instanceof Error ? e.message : 'Could not load inbox');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [router]);

  const openThread = useCallback(async (id: string) => {
    setActiveId(id);
    setThreadLoading(true);
    setSendWarning(null);
    try {
      const j = await api<{ messages: Message[] }>(`/api/whatsapp/conversations/${id}/messages`);
      setMessages(j.messages ?? []);
      setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, unread_count: 0 } : t)));
    } catch (e) {
      if (e instanceof Error && e.message === 'SESSION') {
        router.replace('/login');
        return;
      }
    } finally {
      setThreadLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!activeId) return;
    const t = setInterval(() => {
      void openThread(activeId);
      void loadThreads(true);
    }, 20000);
    return () => clearInterval(t);
  }, [activeId, openThread, loadThreads]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeId]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return threads;
    return threads.filter((t) =>
      `${t.name} ${t.phone} ${t.last_preview}`.toLowerCase().includes(needle)
    );
  }, [threads, q]);

  const active = threads.find((t) => t.id === activeId) ?? null;
  const unreadTotal = threads.reduce((s, t) => s + t.unread_count, 0);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeId || sending) return;
    setSending(true);
    setSendError(null);
    setSendWarning(null);
    try {
      const j = await api<{ message: Message; warning?: string }>('/api/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify({ conversation_id: activeId, body: draft.trim() }),
      });
      setMessages((m) => [...m, j.message]);
      setDraft('');
      if (j.warning) setSendWarning(j.warning);
      void loadThreads(true);
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION') {
        router.replace('/login');
        return;
      }
      setSendError(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  }

  async function startChat(e: React.FormEvent) {
    e.preventDefault();
    setNewError(null);
    if (!newPhone.trim()) {
      setNewError('Phone number is required.');
      return;
    }
    try {
      const j = await api<{ conversation: Conversation }>('/api/whatsapp/conversations', {
        method: 'POST',
        body: JSON.stringify({ phone: newPhone.trim(), name: newName.trim() }),
      });
      setNewOpen(false);
      setNewPhone('');
      setNewName('');
      await loadThreads(true);
      await openThread(j.conversation.id);
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION') {
        router.replace('/login');
        return;
      }
      setNewError(err instanceof Error ? err.message : 'Could not open chat');
    }
  }

  return (
    <PremiumPage
      eyebrow="Core · Inbox"
      title="Unified Inbox"
      description="Live WhatsApp threads from the conversations service — open, reply, and every send is persisted and audited."
      icon={Inbox}
      stats={[
        { label: 'Threads', value: String(threads.length) },
        { label: 'Unread', value: String(unreadTotal) },
        { label: 'Open chat', value: active ? (active.name || active.phone) : '—' },
        { label: 'Messages', value: String(messages.length) },
      ]}
      actions={[{ label: 'View CRM', href: '/dashboard/crm' }]}
    >
      {loading ? (
        <PremiumCard>
          <div className="space-y-2 animate-pulse">
            {[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-100" />)}
          </div>
        </PremiumCard>
      ) : error ? (
        <PremiumCard>
          <p className="font-bold text-slate-900">Inbox unavailable</p>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
          <button onClick={() => loadThreads()} className="mt-3 px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white">Retry</button>
        </PremiumCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PremiumCard className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2 flex-1 bg-slate-100 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats…" className="bg-transparent text-sm w-full focus:outline-none" />
              </div>
              <button onClick={() => setNewOpen(true)} title="New chat" className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-emerald-700 transition">
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => loadThreads()} title="Refresh" className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition">
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <p className="font-bold text-slate-700">No conversations yet</p>
                <p className="text-sm text-slate-400 mt-1">Inbound WhatsApp messages and new chats appear here.</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[520px] overflow-y-auto">
                {filtered.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => openThread(t.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition',
                      t.id === activeId ? 'border-emerald-600/40 bg-emerald-600/5' : 'border-slate-100 hover:border-slate-300'
                    )}
                  >
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1468F5]/15 to-[#8B5CF6]/15 flex items-center justify-center font-extrabold text-[#1468F5] shrink-0">
                      {(t.name || t.phone).charAt(0).toUpperCase()}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">{t.name || t.phone}</span>
                        {t.unread_count > 0 && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">{t.unread_count}</span>
                        )}
                      </span>
                      <span className="block text-xs text-slate-400 truncate">{t.last_preview || t.phone}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">{timeAgo(t.last_message_at)}</span>
                  </button>
                ))}
              </div>
            )}
          </PremiumCard>

          <PremiumCard className="lg:col-span-2 flex flex-col min-h-[420px]">
            {!active ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <p className="font-bold text-slate-700">Select a conversation</p>
                <p className="text-sm text-slate-400 mt-1">Opening a thread marks its inbound messages as read.</p>
              </div>
            ) : (
              <>
                <div className="pb-3 border-b border-slate-100 mb-3">
                  <p className="font-extrabold text-slate-900">{active.name || active.phone}</p>
                  <p className="text-xs text-slate-400">{active.phone} · WhatsApp</p>
                </div>
                <div className="flex-1 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {threadLoading ? (
                    <div className="space-y-2 animate-pulse">
                      {[0, 1, 2].map((i) => <div key={i} className="h-10 rounded-xl bg-slate-100" />)}
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-10">No messages yet — say hello below.</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={clsx('flex', m.direction === 'outbound' ? 'justify-end' : 'justify-start')}>
                        <div className={clsx(
                          'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm',
                          m.direction === 'outbound' ? 'bg-slate-900 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'
                        )}>
                          <p className="whitespace-pre-wrap">{m.body}</p>
                          <p className={clsx('text-[10px] mt-1 flex items-center gap-1', m.direction === 'outbound' ? 'text-white/60 justify-end' : 'text-slate-400')}>
                            {new Date(m.created_at).toLocaleString()}
                            {m.direction === 'outbound' && <CheckCheck className="w-3 h-3" />}
                            {m.direction === 'outbound' && <span>· {m.status}</span>}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>
                {sendWarning && <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">{sendWarning}</p>}
                {sendError && <p className="text-xs text-red-600 mt-2">{sendError}</p>}
                <form onSubmit={send} className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a reply…"
                    maxLength={4096}
                    className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-600"
                  />
                  <button disabled={sending || !draft.trim()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-emerald-700 disabled:opacity-50 transition">
                    <Send className="w-4 h-4" /> {sending ? '…' : 'Send'}
                  </button>
                </form>
              </>
            )}
          </PremiumCard>
        </div>
      )}

      {newOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setNewOpen(false)} />
          <form onSubmit={startChat} className="relative bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">New chat</p>
            <label className="block text-sm font-semibold text-slate-700 mt-3">Phone *
              <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="0803…" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-normal" />
            </label>
            <label className="block text-sm font-semibold text-slate-700 mt-3">Name
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Contact name" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-normal" />
            </label>
            {newError && <p className="text-sm text-red-600 mt-2">{newError}</p>}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-emerald-700">Open chat</button>
              <button type="button" onClick={() => setNewOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </PremiumPage>
  );
}
