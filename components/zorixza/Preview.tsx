import React from 'react';
import { Eye, Database, Plug, Hammer } from 'lucide-react';
import { findWorkspace } from '@/lib/zorixza/workspaces';
import { ZxSection, ZxEmpty } from '@/components/zorixza/ui';

function splitItem(p: string): { title: string; desc: string } {
  const i = p.indexOf(' — ');
  if (i === -1) return { title: p, desc: '' };
  return { title: p.slice(0, i), desc: p.slice(i + 3) };
}

/**
 * UI-first workspace preview (§86): every planned module is visible with its
 * own pages and capability cards BEFORE its backend lands. Nothing here
 * invents numbers or writes data — metrics go live with the phase backend.
 */
export function ZxPreview({ id }: { id: string }) {
  const w = findWorkspace(id);
  if (!w) return <ZxEmpty title="Unknown workspace" hint={`No registry entry for “${id}”.`} />;
  const Icon = w.icon;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <span className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
          <Eye className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-slate-900">Preview workspace — UI first</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            You are seeing the full scope of this module before its backend lands.
            Nothing here writes data yet — live figures arrive with {w.phase}.
          </p>
        </div>
        <span className="text-[10px] font-extrabold px-2 py-1 rounded-md bg-slate-900 text-white whitespace-nowrap shrink-0">
          {w.phase}
        </span>
      </div>

      <ZxSection
        title={`What ${w.label} offers`}
        hint="Every sub-page below ships with the backend phase — descriptions are the contract"
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {w.plannedPages.map((p) => {
            const { title, desc } = splitItem(p);
            return (
              <div key={p} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="font-bold text-slate-900 text-sm">{title}</p>
                {desc && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>}
                <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                  <Hammer className="w-3 h-3" /> Ships in {w.phase}
                </p>
              </div>
            );
          })}
        </div>
      </ZxSection>

      <ZxSection title="Build foundation" hint="Tables and services this workspace will snap onto">
        {w.reuse.length === 0 ? (
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <Database className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
            <p>Greenfield — tables and APIs are versioned in <span className="font-mono text-[13px]">supabase/010–015</span> and land in {w.phase}.</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {w.reuse.map((r) => (
              <li key={r} className="text-sm text-slate-700 flex items-center gap-2">
                <Plug className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono text-[13px]">{r}</span>
                <span className="text-[11px] font-bold text-emerald-700">exists today</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 rounded-xl bg-slate-900 text-white p-4 flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </span>
          <p className="text-xs leading-relaxed text-slate-300">
            <span className="font-bold text-white">{w.label}.</span> {w.desc} Backend phase {w.phase}:
            run the matching migration in the Supabase SQL editor, then the API + live-data wave.
          </p>
        </div>
      </ZxSection>
    </div>
  );
}
