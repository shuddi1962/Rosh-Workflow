'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Menu,
  X,
  LogOut,
  Hexagon,
  ArrowLeftRight,
  Search,
  ChevronDown,
  ChevronRight,
  Map as MapIcon,
  LayoutGrid,
} from 'lucide-react';
import { clsx } from 'clsx';
import { WORKSPACE_GROUPS } from '@/lib/zorixza/workspaces';

// Authenticated shell: never statically prerender (session-gated, personalized).
export const dynamic = 'force-dynamic';

function isActive(pathname: string, href: string) {
  const clean = href.split('?')[0];
  if (clean === '/zorixza') return pathname === '/zorixza';
  if (clean === '/zorixza/roadmap') return pathname.startsWith('/zorixza/roadmap');
  if (clean === '/dashboard' || clean === '/admin') return false;
  return pathname === clean || pathname.startsWith(clean + '/');
}

export default function ZorixzaLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center">
          <span className="text-sm font-semibold text-slate-500">Loading Enterprise…</span>
        </div>
      }
    >
      <ZorixzaShell>{children}</ZorixzaShell>
    </Suspense>
  );
}

function ZorixzaShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Overview: true,
    Revenue: true,
    Operations: false,
    Finance: false,
    People: false,
    Platform: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { zxSession } = await import('@/lib/zorixza/client');
      const session = await zxSession();
      if (cancelled) return;
      if (!session.ok) {
        router.replace('/login');
        return;
      }
      setUserName(session.userName);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Auto-expand the group holding the active workspace.
  useEffect(() => {
    const mod = searchParams.get('module');
    WORKSPACE_GROUPS.forEach((g) => {
      const hit = g.workspaces.some(
        (w) => isActive(pathname, w.href) || (mod && w.id === mod)
      );
      if (hit) setExpanded((p) => ({ ...p, [g.label]: true }));
    });
  }, [pathname, searchParams]);

  const activeModule = searchParams.get('module');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WORKSPACE_GROUPS;
    return WORKSPACE_GROUPS.map((g) => ({
      ...g,
      workspaces: g.workspaces.filter(
        (w) => w.label.toLowerCase().includes(q) || w.desc.toLowerCase().includes(q)
      ),
    })).filter((g) => g.workspaces.length > 0);
  }, [query]);

  const currentLabel = useMemo(() => {
    for (const g of WORKSPACE_GROUPS) {
      for (const w of g.workspaces) {
        if (w.status === 'live' && isActive(pathname, w.href)) return w.label;
        if (w.status === 'build' && pathname.startsWith('/zorixza/roadmap') && activeModule === w.id)
          return w.label;
      }
    }
    return 'Workspace';
  }, [pathname, activeModule]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return WORKSPACE_GROUPS.flatMap((g) => g.workspaces)
      .filter((w) => w.label.toLowerCase().includes(q) || w.desc.toLowerCase().includes(q))
      .slice(0, 7);
  }, [query]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F4F7F4] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-600/25">
            <Hexagon className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-500">Loading Enterprise…</span>
        </div>
      </div>
    );
  }

  const go = (href: string) => {
    setOpen(false);
    setQuery('');
    setMenuOpen(false);
    router.push(href);
  };

  const openMenu = () => {
    if (menuTimer.current) clearTimeout(menuTimer.current);
    setMenuOpen(true);
  };
  const scheduleMenuClose = () => {
    if (menuTimer.current) clearTimeout(menuTimer.current);
    menuTimer.current = setTimeout(() => setMenuOpen(false), 140);
  };

  const signOut = () => {
    for (const k of ['accessToken', 'refreshToken', 'userRole', 'userName', 'userDepartment', 'staffRole', 'businessId']) {
      localStorage.removeItem(k);
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex flex-col">
      {/* emerald hairline — Enterprise brand */}
      <div className="h-[2px] w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500" />

      <div className="flex flex-1 min-h-0 w-full">
        {open && (
          <div className="fixed inset-0 bg-slate-950/50 z-40 lg:hidden" onClick={() => setOpen(false)} />
        )}

        {/* ── Sidebar (Marketing-shell pattern, emerald accents) ── */}
        <aside
          className={clsx(
            'fixed lg:static inset-y-0 left-0 z-50 w-[272px] bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-300',
            open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <button onClick={() => go('/zorixza')} className="flex items-center gap-2.5 text-left">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/25">
                  <Hexagon className="w-5 h-5 text-white" />
                </span>
                <span className="leading-none">
                  <span className="block font-extrabold tracking-[0.14em] text-slate-900">ZORIXZA</span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 mt-1">
                    Enterprise
                  </span>
                </span>
              </button>
              <button onClick={() => setOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-900" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find workspace…"
                className="bg-transparent text-[13px] w-full focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {filtered.map((group) => {
              const isOpen = expanded[group.label] ?? false;
              const hasActive = group.workspaces.some((w) => isActive(pathname, w.href));
              return (
                <div key={group.label}>
                  <button
                    onClick={() => setExpanded((p) => ({ ...p, [group.label]: !p[group.label] }))}
                    className={clsx(
                      'w-full flex items-center justify-between px-2 pb-1 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors',
                      hasActive ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    {group.label}
                    {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  {isOpen && (
                    <div className="space-y-0.5 mt-1">
                      {group.workspaces.map((w) => {
                        const active =
                          (w.status === 'live' && isActive(pathname, w.href)) ||
                          (w.status === 'build' && pathname.startsWith('/zorixza/roadmap') && activeModule === w.id);
                        return (
                          <button
                            key={w.id}
                            onClick={() => go(w.href)}
                            title={w.desc}
                            className={clsx(
                              'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-semibold transition-all border-l-2',
                              active
                                ? 'bg-emerald-600/[0.08] text-emerald-800 border-emerald-600'
                                : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            )}
                          >
                            <w.icon className={clsx('w-4 h-4 shrink-0', active ? 'text-emerald-700' : 'text-slate-400')} />
                            <span className="flex-1 text-left truncate">{w.label}</span>
                            {w.status === 'build' ? (
                              <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 shrink-0">
                                {w.phase}
                              </span>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-100 space-y-1">
            <button
              onClick={() => go('/dashboard')}
              title="Switch to Marketing workspace (same login)"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-bold text-[#1468F5] bg-[#1468F5]/[0.06] border border-[#1468F5]/15 hover:bg-[#1468F5]/10 transition"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Marketing
            </button>
            <div className="flex items-center gap-2.5 px-3 py-2">
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-extrabold">
                {userName.charAt(0).toUpperCase()}
              </span>
              <span className="flex-1 min-w-0 text-sm font-bold text-slate-800 truncate">{userName}</span>
              <button onClick={signOut} title="Sign out" className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ── Content column ── */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <header className="bg-white/90 backdrop-blur border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center gap-3 sticky top-0 z-30">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="font-bold text-slate-900">Enterprise</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 truncate">{currentLabel}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* Global workspace catalog (hover mega-menu) */}
              <div className="hidden lg:block relative" onMouseEnter={openMenu} onMouseLeave={scheduleMenuClose}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold transition',
                    menuOpen ? 'bg-emerald-600/[0.08] text-emerald-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Workspaces
                  <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', menuOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      onMouseEnter={openMenu}
                      onMouseLeave={scheduleMenuClose}
                      className="absolute right-0 top-full pt-2 z-50"
                    >
                      <div className="w-[680px] max-w-[90vw] max-h-[70vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-4">
                        <div className="h-1 -m-4 mb-4 rounded-t-2xl bg-gradient-to-r from-emerald-600 to-teal-500" />
                        <div className="grid grid-cols-2 gap-4">
                          {WORKSPACE_GROUPS.map((g) => (
                            <div key={g.label}>
                              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 px-1 mb-1.5">
                                {g.label}
                              </p>
                              <div className="space-y-0.5">
                                {g.workspaces.map((w) => (
                                  <button
                                    key={w.id}
                                    onClick={() => go(w.href)}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-emerald-600/5 text-left transition group"
                                  >
                                    <span className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 text-slate-600 transition">
                                      <w.icon className="w-4 h-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block text-[13px] font-bold text-slate-800">{w.label}</span>
                                      <span className="block text-[11px] text-slate-400 truncate">{w.desc}</span>
                                    </span>
                                    {w.status === 'build' && (
                                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 shrink-0">
                                        {w.phase}
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="hidden md:block relative">
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 w-56 focus-within:bg-white focus-within:border-emerald-600/50 transition">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults[0]) go(searchResults[0].href);
                    }}
                    placeholder="Search workspaces…"
                    className="bg-transparent text-[13px] w-full focus:outline-none placeholder:text-slate-400"
                  />
                </div>
                {query.trim().length >= 2 && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50">
                    {searchResults.length === 0 ? (
                      <p className="px-3 py-2.5 text-sm text-slate-400">No workspace matches.</p>
                    ) : (
                      searchResults.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => go(w.href)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-600/5 text-left transition"
                        >
                          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <w.icon className="w-4 h-4 text-slate-600" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[13px] font-bold text-slate-800">{w.label}</span>
                            <span className="block text-[11px] text-slate-400 truncate">{w.desc}</span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live data
              </span>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto">{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile quick strip */}
      <div className="lg:hidden bg-white border-t border-slate-200 overflow-x-auto">
        <div className="flex gap-1.5 px-3 py-2">
          <button
            onClick={() => go('/zorixza')}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap',
              pathname === '/zorixza' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            Overview
          </button>
          {WORKSPACE_GROUPS.flatMap((g) => g.workspaces)
            .filter((w) => w.status === 'live' && w.href !== '/zorixza')
            .map((w) => (
              <button
                key={w.id}
                onClick={() => go(w.href)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap',
                  isActive(pathname, w.href) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                )}
              >
                {w.label}
              </button>
            ))}
          <button
            onClick={() => go('/zorixza/roadmap')}
            className={clsx(
              'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap',
              pathname.startsWith('/zorixza/roadmap') ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            <MapIcon className="w-3.5 h-3.5" /> All workspaces
          </button>
        </div>
      </div>
    </div>
  );
}
