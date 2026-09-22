'use client';

import React, { useState } from 'react';
import { X, Building2, User, Mail, Phone, Briefcase } from 'lucide-react';
import type { BusinessRegistration } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BusinessRegistration) => void;
}

export const RegisterBusinessModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '', ownerName: '', ownerEmail: '', phone: '', industry: '', plan: 'Growth' as 'Starter' | 'Growth' | 'Enterprise',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      logoEmoji: '🏢',
      currency: 'NGN',
      currencySymbol: '₦',
      monthlyRevenue: 0,
      revenueGrowth: 0,
      totalLeads: 0,
      leadsGrowth: 0,
      conversionRate: 0,
      conversionGrowth: 0,
      avgOrderValue: 0,
      activeCampaignsCount: 0,
      newCustomersCount: 0,
      productsSummary: 'New business — awaiting product catalog setup',
    });
    onClose();
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Register Your Business</h2>
            <p className="text-sm text-slate-500">Launch your AI engine in 2 minutes</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input placeholder="Business Name" className={`${inputClass} pl-10`} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input placeholder="Your Name" className={`${inputClass} pl-10`} required value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input type="email" placeholder="Email Address" className={`${inputClass} pl-10`} required value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input placeholder="Phone Number" className={`${inputClass} pl-10`} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <select className={`${inputClass} pl-10 appearance-none`} required value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}>
              <option value="">Select Industry</option>
              <option value="Marine & Oil Gas">Marine & Oil Gas</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Retail & Fashion">Retail & Fashion</option>
              <option value="Security & Surveillance">Security & Surveillance</option>
              <option value="Professional Services">Professional Services</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['Starter', 'Growth', 'Enterprise'] as const).map((p) => (
              <button key={p} type="button" onClick={() => setForm({ ...form, plan: p })} className={`py-3 rounded-xl text-sm font-semibold border transition ${form.plan === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                {p}
              </button>
            ))}
          </div>
          <button type="submit" className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#1468F5] to-[#3B82F6] text-white hover:shadow-xl transition mt-2">
            Launch AI Engine
          </button>
        </form>
      </div>
    </div>
  );
};
