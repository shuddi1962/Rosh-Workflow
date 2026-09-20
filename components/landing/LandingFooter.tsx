'use client';

import React from 'react';
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react';

export const LandingFooter: React.FC = () => (
  <footer className="bg-slate-900 text-slate-300 py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">ROSH AI</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">Intelligent business automation for African enterprises. Powered by AI, built for growth.</p>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-white transition">Features</a></li>
            <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
            <li><a href="#industries" className="hover:text-white transition">Industries</a></li>
            <li><a href="#" className="hover:text-white transition">API Docs</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition">About</a></li>
            <li><a href="#" className="hover:text-white transition">Blog</a></li>
            <li><a href="#" className="hover:text-white transition">Careers</a></li>
            <li><a href="#" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 08109522432</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@roshanalinfotech.com</li>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5" /> No 18A Rumuola Road, Port Harcourt</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Roshanal Infotech Limited. All rights reserved.
      </div>
    </div>
  </footer>
);
