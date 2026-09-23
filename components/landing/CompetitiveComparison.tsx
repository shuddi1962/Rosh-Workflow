'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

export const CompetitiveComparison: React.FC = () => {
  const rows = [
    ['Autonomous lead qualification', true, false],
    ['WhatsApp auto-responder', true, false],
    ['Competitor intelligence radar', true, false],
    ['Unified CRM + campaigns', true, false],
    ['AI content studio', true, false],
    ['Monthly tool cost', '₦149,000', '₦800,000+'],
  ];

  return (
    <section id="compare" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F6F9FD]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0A1833] mb-4">GrowPilot vs Fragmented Multi-Tool Stack</h2>
          <p className="text-lg text-slate-600">One operating system beats five disconnected tools.</p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F6F9FD]">
                <th className="text-left p-4 font-semibold text-slate-700">Capability</th>
                <th className="text-center p-4 font-semibold text-[#1468F5]">GrowPilot Operating System</th>
                <th className="text-center p-4 font-semibold text-slate-500">Fragmented Stack</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="p-4 text-slate-700">{row[0]}</td>
                  <td className="p-4 text-center text-[#1468F5]">{row[1] === true ? <Check className="w-5 h-5 mx-auto" /> : row[1]}</td>
                  <td className="p-4 text-center text-slate-400">{row[2] === false ? <X className="w-5 h-5 mx-auto" /> : row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};