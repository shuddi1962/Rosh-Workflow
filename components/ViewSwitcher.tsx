'use client';

import React from 'react';
import { ViewMode } from '@/lib/types';
import { LayoutDashboard, Globe } from 'lucide-react';

interface Props {
  currentView: ViewMode;
  onSwitch: (view: ViewMode) => void;
}

export const ViewSwitcher: React.FC<Props> = ({ currentView, onSwitch }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-1.5 flex gap-1">
    <button
      onClick={() => onSwitch('landing')}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
        currentView === 'landing' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      <Globe className="w-4 h-4" />
      Landing
    </button>
    <button
      onClick={() => onSwitch('dashboard')}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
        currentView === 'dashboard' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      <LayoutDashboard className="w-4 h-4" />
      Dashboard
    </button>
  </div>
);
