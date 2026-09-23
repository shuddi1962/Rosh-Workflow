'use client';

import React, { useState } from 'react';
import { Sparkles, Menu, X, ChevronDown } from 'lucide-react';

interface Props {
  onOpenDashboard: () => void;
  onOpenRegisterModal: () => void;
}

export const LandingNavbar: React.FC<Props> = ({ onOpenDashboard, onOpenRegisterModal }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-[#1468F5] to-[#3B82F6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">GrowPilot</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#top" className="hover:text-[#1468F5] transition">Home</a>
            <a href="#features" className="hover:text-[#1468F5] transition">Solutions</a>
            <a href="#industries" className="hover:text-[#1468F5] transition">Industries</a>
            <a href="#pricing" className="hover:text-[#1468F5] transition">Pricing</a>
            <a href="#resources" className="hover:text-[#1468F5] transition">Resources</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={onOpenDashboard} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              Sign In
            </button>
            <button onClick={onOpenRegisterModal} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1468F5] text-white hover:bg-[#1257D4] transition shadow-lg shadow-blue-500/25">
              Get Started Free
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-3">
          <a href="#top" className="block py-2 text-sm font-medium text-slate-600">Home</a>
          <a href="#features" className="block py-2 text-sm font-medium text-slate-600">Solutions</a>
          <a href="#industries" className="block py-2 text-sm font-medium text-slate-600">Industries</a>
          <a href="#pricing" className="block py-2 text-sm font-medium text-slate-600">Pricing</a>
          <a href="#resources" className="block py-2 text-sm font-medium text-slate-600">Resources</a>
          <div className="flex gap-2 pt-2">
            <button onClick={onOpenDashboard} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200">Sign In</button>
            <button onClick={onOpenRegisterModal} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#1468F5] text-white">Get Started Free</button>
          </div>
        </div>
      )}
    </nav>
  );
};