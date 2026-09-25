'use client';

import React from 'react';
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react';

export const LandingFooter: React.FC = () => (
  <footer className="bg-[#071426] text-slate-300 py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-[#1468F5] to-[#3B82F6] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Zorixza</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400 mb-4">The AI business operating system for modern teams.</p>
          <div className="flex gap-3">
            {['Twitter', 'LinkedIn', 'Instagram'].map((s) => (
              <div key={s} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs text-slate-400 hover:bg-white/10 transition cursor-pointer">{s[0]}</div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-white transition">Features</a></li>
            <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
            <li><a href="#industries" className="hover:text-white transition">Industries</a></li>
            <li><a href="#features" className="hover:text-white transition">Integrations</a></li>
            <li><a href="#resources" className="hover:text-white transition">Changelog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Solutions</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-white transition">Marketing</a></li>
            <li><a href="#features" className="hover:text-white transition">Sales</a></li>
            <li><a href="#features" className="hover:text-white transition">Commerce</a></li>
            <li><a href="#features" className="hover:text-white transition">Automation</a></li>
            <li><a href="#features" className="hover:text-white transition">Analytics</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#resources" className="hover:text-white transition">Help Center</a></li>
            <li><a href="#resources" className="hover:text-white transition">Documentation</a></li>
            <li><a href="#resources" className="hover:text-white transition">Guides</a></li>
            <li><a href="#resources" className="hover:text-white transition">Customers</a></li>
            <li><a href="#resources" className="hover:text-white transition">Webinars</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <span>&copy; 2026 Zorixza. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="/legal#privacy" className="hover:text-white transition">Privacy Policy</a>
          <a href="/legal#terms" className="hover:text-white transition">Terms of Service</a>
          <a href="/legal#security" className="hover:text-white transition">Security</a>
          <a href="/legal#contact" className="hover:text-white transition">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);