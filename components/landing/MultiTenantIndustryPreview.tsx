'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { ArrowRight } from 'lucide-react';

export const MultiTenantIndustryPreview: React.FC = () => {
  const { tenants, switchTenant } = useTenant();

  return (
    <section id="industries" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Built for Your Industry</h2>
          <p className="text-lg text-slate-600">Rosh AI adapts to your business — marine, healthcare, fashion, or any vertical.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tenants.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTenant(t.id)}
              className="text-left bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-200 hover:shadow-xl transition-all group"
            >
              <div className="text-4xl mb-4">{t.logoEmoji}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{t.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{t.industry}</p>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">{t.productsSummary}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all">
                View Demo <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
