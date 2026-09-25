'use client';

import React from 'react';
import { Sparkles, Hexagon, ArrowRight } from 'lucide-react';

interface Props {
  onOpenMarketing: () => void;
  onOpenEnterprise: () => void;
}

export const DualBusinessSection: React.FC<Props> = ({ onOpenMarketing, onOpenEnterprise }) => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-100">
    <div className="max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-3">One platform · Two workspaces</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1833]">
          Choose the workspace you need today
        </h2>
        <p className="text-slate-500 mt-3">
          Zorixza Marketing grows the business. Zorixza Enterprise runs the business. Same account, same company data.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Marketing workspace */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-shadow flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1468F5] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/25 mb-5">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">Zorixza Marketing</h3>
          <p className="text-sm font-semibold text-[#1468F5] mt-1">AI Marketing & Sales Growth</p>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed flex-1">
            Attract customers and close faster — AI content, trend radar, competitor
            intelligence, social automation, UGC ads, campaigns and CRM pipeline
            for marine and technology businesses.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
            <li>✓ Content Brain + Social Planner</li>
            <li>✓ CRM pipeline + WhatsApp + campaigns</li>
            <li>✓ Competitor intel + UGC ad studio</li>
          </ul>
          <button
            onClick={onOpenMarketing}
            className="mt-6 w-full py-3 rounded-xl text-sm font-bold bg-[#1468F5] text-white hover:bg-[#1257D4] transition flex items-center justify-center gap-2"
          >
            Open Marketing <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Enterprise workspace */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 shadow-sm hover:shadow-xl transition-shadow flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-5">
            <Hexagon className="w-6 h-6 text-slate-950" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-extrabold text-white tracking-[0.08em]">ZORIXZA ENTERPRISE</h3>
          <p className="text-sm font-semibold text-emerald-400 mt-1">Business Operating System</p>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed flex-1">
            Run the whole operation — executive overview, CRM, inventory and
            warehouses, daily operations, document custody and staff reporting,
            with accounting, HR, AuditIQ and field service shipping in phases.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
            <li>✓ Executive, CRM, inventory & operations live now</li>
            <li>✓ Real figures — no demo numbers</li>
            <li>✓ Same login as Marketing</li>
          </ul>
          <button
            onClick={onOpenEnterprise}
            className="mt-6 w-full py-3 rounded-xl text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition flex items-center justify-center gap-2"
          >
            Open Enterprise <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </section>
);
