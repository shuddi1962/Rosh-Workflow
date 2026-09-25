'use client';

import React, { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Map as MapIcon, ArrowRight, CheckCircle2, Hammer, Database, Plug, ListChecks } from 'lucide-react';
import { clsx } from 'clsx';
import { ALL_WORKSPACES, WORKSPACE_GROUPS, findWorkspace } from '@/lib/zorixza/workspaces';
import { PROGRAM_PHASES, PHASE_TONE } from '@/lib/zorixza/program';
import { ZxPageHead } from '@/components/zorixza/ui';

function RoadmapInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('module');
  const selected = selectedId ? findWorkspace(selectedId) : null;

  const live = useMemo(() => ALL_WORKSPACES.filter((w) => w.status === 'live'), []);
  const build = useMemo(() => ALL_WORKSPACES.filter((w) => w.status === 'build'), []);

  return (
    <>
      <ZxPageHead
        eyebrow="Zorixza · Program"
        title="Workspace rollout"
        desc={`${live.length} workspaces live on real data · ${build.length} in phased build. Nothing here is faked — each card shows its exact phase and backing.`}
      />

      {selected && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <selected.icon className="w-6 h-6" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                {selected.group} · {selected.phase} · {selected.status === 'live' ? 'Live' : 'In build'}
              </p>
              <h2 className="text-xl font-extrabold text-slate-900">{selected.label}</h2>
              <p className="text-sm text-slate-500 mt-1">{selected.desc}</p>
            </div>
            {selected.status === 'live' ? (
              <button
                onClick={() => router.push(selected.href)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shrink-0"
              >
                Open workspace <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-500 shrink-0">
                <Hammer className="w-4 h-4" /> Ships in {selected.phase}
              </span>
            )}
          </div>

          {selected.status === 'build' && (
            <div className="grid md:grid-cols-2 gap-4 mt-5">
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Planned pages</p>
                <ul className="space-y-1.5">
                  {selected.plannedPages.map((p) => (
                    <li key={p} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-slate-300">—</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Already reusable</p>
                {selected.reuse.length === 0 ? (
                  <p className="text-sm text-slate-400">Greenfield — tables and APIs to be built in {selected.phase}.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {selected.reuse.map((r) => (
                      <li key={r} className="text-sm text-slate-700 flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-mono text-[13px]">{r}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 mb-4">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-slate-700" /> Full program — every phase, nothing hidden
        </h2>
        <p className="text-xs text-slate-400 mt-1">P0–P33 from the build program. Counts update as phases land.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-2 pr-3">Phase</th>
                <th className="py-2 pr-3">Scope</th>
                <th className="py-2 pr-3">State of play</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {PROGRAM_PHASES.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5 pr-3 font-mono font-extrabold text-slate-700 whitespace-nowrap">{p.id}</td>
                  <td className="py-2.5 pr-3 font-semibold text-slate-800">{p.label}</td>
                  <td className="py-2.5 pr-3 text-slate-500">{p.detail}</td>
                  <td className="py-2.5 text-right">
                    <span className={clsx('inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap', PHASE_TONE[p.status])}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 mb-4">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Live now ({live.length})
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {live.map((w) => (
            <button
              key={w.id}
              onClick={() => router.push(w.href)}
              className="text-left rounded-xl border border-slate-200 p-4 hover:border-emerald-600/40 hover:shadow-lg transition group"
            >
              <span className="flex items-center gap-2.5">
                <w.icon className="w-5 h-5 text-emerald-700" />
                <span className="font-bold text-slate-900 text-sm">{w.label}</span>
              </span>
              <span className="block text-xs text-slate-500 mt-1.5 leading-relaxed">{w.desc}</span>
              <span className="block text-xs font-bold text-emerald-700 mt-2 group-hover:translate-x-0.5 transition-transform">
                Open →
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
          <Hammer className="w-5 h-5 text-slate-400" /> Phased build ({build.length})
        </h2>
        <p className="text-xs text-slate-400 mt-1">Click any workspace for its exact scope, phase and reusable parts.</p>
        {WORKSPACE_GROUPS.map((g) => {
          const items = g.workspaces.filter((w) => w.status === 'build');
          if (items.length === 0) return null;
          return (
            <div key={g.label} className="mt-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400 mb-2">{g.label}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => router.push(`/zorixza/roadmap?module=${w.id}`)}
                    className={clsx(
                      'text-left rounded-xl border p-4 transition',
                      selected?.id === w.id
                        ? 'border-slate-900 shadow-md'
                        : 'border-slate-200 hover:border-slate-400'
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <w.icon className="w-5 h-5 text-slate-500" />
                      <span className="font-bold text-slate-800 text-sm flex-1">{w.label}</span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        {w.phase}
                      </span>
                    </span>
                    <span className="block text-xs text-slate-500 mt-1.5 leading-relaxed">{w.desc}</span>
                    {w.reuse.length > 0 && (
                      <span className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <Database className="w-3 h-3" /> {w.reuse.length} reusable part{w.reuse.length > 1 ? 's' : ''}
                        <Plug className="w-3 h-3 ml-1" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}

export default function ZorixzaRoadmapPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading rollout…</p>}>
      <div className="mb-5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
        <MapIcon className="w-4 h-4" /> Zorixza · Program
      </div>
      <RoadmapInner />
    </Suspense>
  );
}
