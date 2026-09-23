'use client';

import React, { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { PLANS, planHas, type PlanName } from '@/lib/plans';

export const PricingSection: React.FC = () => {
  const [viewPlan, setViewPlan] = useState<PlanName>('Starter');

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1833] mb-4">Flexible Plans for Every Stage of Growth</h2>
          <p className="text-lg text-slate-600">Not every plan includes everything — pick a plan below to see exactly what&apos;s included and what needs an upgrade.</p>
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            {PLANS.map((p) => (
              <button
                key={p.name}
                onClick={() => setViewPlan(p.name)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${viewPlan === p.name ? 'bg-[#0A1833] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Viewing features for <span className="font-bold text-slate-800">{viewPlan}</span> — locked items show which plan unlocks them.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PLANS.map((p) => {
            const isViewing = viewPlan === p.name;
            return (
              <div key={p.name} className={`rounded-2xl border p-8 flex flex-col ${p.highlighted ? 'border-[#1468F5] shadow-2xl shadow-blue-500/10 bg-white relative' : 'border-slate-200 bg-white'} ${isViewing ? 'ring-2 ring-[#0A1833]/10' : ''}`}>
                {p.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1468F5] text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-slate-900">{p.price}</span>
                  <span className="text-sm text-slate-500">{p.period}</span>
                </div>
                {p.yearlyPrice && <p className="text-xs text-[#10B981] font-semibold mb-3">or {p.yearlyPrice} — save 20%</p>}
                <p className="text-sm text-slate-600 mb-2">{p.desc}</p>
                <p className="text-xs font-semibold text-slate-500 mb-4">{p.teamMembers} · {p.leadsPerMonth}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {p.features.map((f) => {
                    const included = planHas(p.name, f.minPlan);
                    return (
                      <li key={f.label} className={`flex items-center gap-2 text-sm ${included ? 'text-slate-700' : 'text-slate-400'}`}>
                        {included ? (
                          <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        )}
                        <span className={included ? '' : 'line-through decoration-slate-300'}>{f.label}</span>
                        {!included && (
                          <span className="ml-auto text-[11px] font-bold text-[#F59E0B] whitespace-nowrap">Needs {f.minPlan}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <a
                  href="/register"
                  className={`w-full py-3 rounded-xl text-sm font-bold transition text-center ${p.highlighted ? 'bg-[#1468F5] text-white hover:bg-[#1257D0]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {p.cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
