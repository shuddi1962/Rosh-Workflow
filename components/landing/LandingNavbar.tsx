'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Sparkles, Menu, X } from 'lucide-react';

interface Props {
  onOpenDashboard: () => void;
  onOpenRegisterModal: () => void;
}

export const LandingNavbar: React.FC<Props> = ({ onOpenDashboard, onOpenRegisterModal }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">ROSH AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#industries" className="hover:text-blue-600 transition">Industries</a>
            <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
            <button onClick={onOpenDashboard} className="hover:text-blue-600 transition">Login</button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={onOpenRegisterModal} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
              Start Free Trial
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-3">
          <a href="#features" className="block py-2 text-sm font-medium text-slate-600">Features</a>
          <a href="#industries" className="block py-2 text-sm font-medium text-slate-600">Industries</a>
          <a href="#pricing" className="block py-2 text-sm font-medium text-slate-600">Pricing</a>
          <button onClick={onOpenDashboard} className="block py-2 text-sm font-medium text-slate-600">Login</button>
          <button onClick={onOpenRegisterModal} className="w-full py-3 rounded-xl text-sm font-semibold bg-slate-900 text-white">Start Free Trial</button>
        </div>
      )}
    </nav>
  );
};
