'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AutomationRoutine, BusinessTenant, BusinessRegistration } from '@/lib/types';

interface TenantContextType {
  currentTenant: BusinessTenant;
  tenants: BusinessTenant[];
  switchTenant: (tenantId: string) => void;
  registerBusiness: (business: BusinessRegistration) => void;
  updateTenant: (tenantId: string, patch: Partial<BusinessTenant>) => void;
  toggleAutomation: (automationId: string) => void;
  formatCurrency: (amount: number) => string;
  isRegistrationOpen: boolean;
  setIsRegistrationOpen: (open: boolean) => void;
  activeFilterPeriod: 'today' | '7d' | '30d' | 'ytd';
  setActiveFilterPeriod: (period: 'today' | '7d' | '30d' | 'ytd') => void;
  siteSwitcherOpen: boolean;
  setSiteSwitcherOpen: (open: boolean) => void;
}

const DEFAULT_TENANTS: BusinessTenant[] = [
  {
    id: 'roshanal',
    name: 'Roshanal Infotech',
    logoEmoji: '⚓',
    industry: 'Marine & Technology',
    currency: 'NGN',
    currencySymbol: '₦',
    ownerName: 'Roshanal Team',
    ownerEmail: 'info@roshanalinfotech.com',
    plan: 'Enterprise',
    monthlyRevenue: 12500000,
    revenueGrowth: 28.5,
    totalLeads: 2340,
    leadsGrowth: 22.1,
    conversionRate: 12.4,
    conversionGrowth: 3.8,
    avgOrderValue: 450000,
    activeCampaignsCount: 8,
    newCustomersCount: 186,
    productsSummary: 'Suzuki/Yamaha outboard engines, Hikvision CCTV, solar systems, fiberglass boats',
    automations: [
      { id: 'auto-r1', title: 'WhatsApp Product Inquiry Auto-responder', description: 'Instantly qualifies inbound marine/tech product inquiries.', channel: 'whatsapp', active: true, executionsToday: 94, lastExecution: '2m ago', successRate: '98.7%' },
      { id: 'auto-r2', title: 'Oil & Gas Marine Compliance Outreach', description: 'Targets Niger Delta operators with safety equipment packages.', channel: 'email', active: true, executionsToday: 28, lastExecution: '18m ago', successRate: '95.3%' },
      { id: 'auto-r3', title: 'CCTV Installation Lead Follow-up', description: 'Re-engages website visitors who viewed Hikvision products.', channel: 'whatsapp', active: true, executionsToday: 45, lastExecution: '7m ago', successRate: '97.1%' },
    ],
    revenueHistory: [
      { label: 'Jan', current: 8200000, previous: 6800000 }, { label: 'Feb', current: 9100000, previous: 7400000 }, { label: 'Mar', current: 9800000, previous: 8100000 }, { label: 'Apr', current: 10500000, previous: 8800000 }, { label: 'May', current: 11200000, previous: 9500000 }, { label: 'Jun', current: 11900000, previous: 10100000 }, { label: 'Jul', current: 12500000, previous: 10800000 },
    ],
  },
  {
    id: 'beacon-health',
    name: 'Beacon Health Diagnostics',
    logoEmoji: '🏥',
    industry: 'Healthcare & Clinics',
    currency: 'NGN',
    currencySymbol: '₦',
    ownerName: 'Dr. Tunde Alabi',
    ownerEmail: 'tunde@beaconhealth.ng',
    plan: 'Growth',
    monthlyRevenue: 4820000,
    revenueGrowth: 22.4,
    totalLeads: 1420,
    leadsGrowth: 18.2,
    conversionRate: 14.8,
    conversionGrowth: 4.2,
    avgOrderValue: 85000,
    activeCampaignsCount: 4,
    newCustomersCount: 312,
    productsSummary: 'Executive Health MOT, Diagnostic blood screens, Corporate screening retainers',
    automations: [
      { id: 'auto-1', title: 'WhatsApp Instant Triage & Booking', description: 'Auto-qualifies inbound patient symptoms.', channel: 'whatsapp', active: true, executionsToday: 68, lastExecution: '3m ago', successRate: '98.5%' }, { id: 'auto-2', title: 'Corporate Retainer Re-engagement', description: 'Pings HR managers 30 days before annual health checks.', channel: 'email', active: true, executionsToday: 14, lastExecution: '24m ago', successRate: '94.2%' }, { id: 'auto-3', title: 'Lab Results Dispatch & Up-sell', description: 'Sends secure SMS notifications when reports are ready.', channel: 'sms', active: true, executionsToday: 42, lastExecution: '11m ago', successRate: '99.1%' },
    ],
    revenueHistory: [
      { label: 'Jan', current: 3100000, previous: 2600000 }, { label: 'Feb', current: 3450000, previous: 2900000 }, { label: 'Mar', current: 3800000, previous: 3100000 }, { label: 'Apr', current: 4100000, previous: 3500000 }, { label: 'May', current: 4350000, previous: 3750000 }, { label: 'Jun', current: 4600000, previous: 4000000 }, { label: 'Jul', current: 4820000, previous: 4150000 },
    ],
  },
  {
    id: 'aurora-fashion',
    name: 'Aurora Silk & Couture',
    logoEmoji: '👗',
    industry: 'Retail & Fashion',
    currency: 'USD',
    currencySymbol: '$',
    ownerName: 'Elena Rostova',
    ownerEmail: 'elena@auroraluxe.com',
    plan: 'Enterprise',
    monthlyRevenue: 84200,
    revenueGrowth: 31.8,
    totalLeads: 3840,
    leadsGrowth: 26.5,
    conversionRate: 6.4,
    conversionGrowth: 2.1,
    avgOrderValue: 240,
    activeCampaignsCount: 6,
    newCustomersCount: 642,
    productsSummary: 'Handcrafted mulberry silk robes, evening slips, private styling concierge',
    automations: [
      { id: 'auto-f1', title: 'VIP Abandoned Cart Recovery Concierge', description: 'Dispatches personalized WhatsApp/SMS voice-styled offers.', channel: 'whatsapp', active: true, executionsToday: 112, lastExecution: '1m ago', successRate: '96.2%' }, { id: 'auto-f2', title: 'Capsule Drop Social Auto-responder', description: 'Auto-DMs lookbooks when someone comments "LUXE".', channel: 'meta', active: true, executionsToday: 340, lastExecution: 'Just now', successRate: '99.4%' },
    ],
    revenueHistory: [
      { label: 'Jan', current: 52000, previous: 41000 }, { label: 'Feb', current: 58000, previous: 46000 }, { label: 'Mar', current: 63000, previous: 49000 }, { label: 'Apr', current: 69000, previous: 53000 }, { label: 'May', current: 74000, previous: 59000 }, { label: 'Jun', current: 79000, previous: 64000 }, { label: 'Jul', current: 84200, previous: 68000 },
    ],
  },
  {
    id: 'zenith-realty',
    name: 'Zenith Prime Realty',
    logoEmoji: '🏢',
    industry: 'Real Estate',
    currency: 'NGN',
    currencySymbol: '₦',
    ownerName: 'Chidi Okafor',
    ownerEmail: 'chidi@zenithrealty.ng',
    plan: 'Growth',
    monthlyRevenue: 7200000,
    revenueGrowth: 19.3,
    totalLeads: 890,
    leadsGrowth: 15.7,
    conversionRate: 9.8,
    conversionGrowth: 2.4,
    avgOrderValue: 18500000,
    activeCampaignsCount: 3,
    newCustomersCount: 47,
    productsSummary: 'Diaspora property investment tours, luxury estate sales, mortgage pre-qualification',
    automations: [
      { id: 'auto-z1', title: 'Diaspora Investor Fast-Track', description: 'Auto-qualifies international property inquiries and schedules tours.', channel: 'whatsapp', active: true, executionsToday: 31, lastExecution: '5m ago', successRate: '94.8%' }, { id: 'auto-z2', title: 'Estate Open House Reminder', description: 'Sends personalized invitations 24h before open house events.', channel: 'email', active: true, executionsToday: 12, lastExecution: '45m ago', successRate: '91.2%' }, { id: 'auto-z3', title: 'Mortgage Pre-qualification Bot', description: 'Collects income docs and pre-qualifies buyers automatically.', channel: 'whatsapp', active: false, executionsToday: 0, lastExecution: '2d ago', successRate: '88.5%' },
    ],
    revenueHistory: [
      { label: 'Jan', current: 5400000, previous: 4500000 }, { label: 'Feb', current: 5800000, previous: 4900000 }, { label: 'Mar', current: 6100000, previous: 5200000 }, { label: 'Apr', current: 6400000, previous: 5500000 }, { label: 'May', current: 6700000, previous: 5800000 }, { label: 'Jun', current: 6950000, previous: 6000000 }, { label: 'Jul', current: 7200000, previous: 6100000 },
    ],
  },
];

const STORAGE_KEY = 'rosh-tenants-v1';
const CURRENT_KEY = 'rosh-current-tenant-v1';

function loadTenants(): BusinessTenant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TENANTS;
    const parsed = JSON.parse(raw) as BusinessTenant[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_TENANTS;
    return parsed;
  } catch {
    return DEFAULT_TENANTS;
  }
}

function loadCurrentId(fallback: string): string {
  try {
    return localStorage.getItem(CURRENT_KEY) || fallback;
  } catch {
    return fallback;
  }
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<BusinessTenant[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_TENANTS;
    return loadTenants();
  });
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_TENANTS[0].id;
    return loadCurrentId(DEFAULT_TENANTS[0].id);
  });
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [activeFilterPeriod, setActiveFilterPeriod] = useState<'today' | '7d' | '30d' | 'ytd'>('30d');
  const [siteSwitcherOpen, setSiteSwitcherOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
      localStorage.setItem(CURRENT_KEY, currentTenantId);
    } catch {
      // storage full or unavailable — tenants still work for this session
    }
  }, [tenants, currentTenantId]);

  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];

  const switchTenant = useCallback((tenantId: string) => {
    setTenants((prev) => {
      if (prev.find((t) => t.id === tenantId)) setCurrentTenantId(tenantId);
      return prev;
    });
  }, []);

  const registerBusiness = useCallback((business: BusinessRegistration) => {
    const newId = business.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
    const defaultRoutines: AutomationRoutine[] = [
      { id: `auto-${Date.now()}-1`, title: `WhatsApp Concierge for ${business.name}`, description: `Auto-qualifies incoming buyers and delivers instant quotes.`, channel: 'whatsapp', active: true, executionsToday: 1, lastExecution: 'Just registered', successRate: '100%' },
      { id: `auto-${Date.now()}-2`, title: 'Competitor Price & Ad Radar', description: 'Tracks competing offerings to flag undercut pricing.', channel: 'crm', active: true, executionsToday: 2, lastExecution: 'Configured', successRate: '98.0%' },
    ];
    const baseRev = business.monthlyRevenue || 1200000;
    const history = [
      { label: 'Jan', current: Math.round(baseRev * 0.65), previous: Math.round(baseRev * 0.55) }, { label: 'Feb', current: Math.round(baseRev * 0.72), previous: Math.round(baseRev * 0.60) }, { label: 'Mar', current: Math.round(baseRev * 0.80), previous: Math.round(baseRev * 0.65) }, { label: 'Apr', current: Math.round(baseRev * 0.85), previous: Math.round(baseRev * 0.72) }, { label: 'May', current: Math.round(baseRev * 0.90), previous: Math.round(baseRev * 0.78) }, { label: 'Jun', current: Math.round(baseRev * 0.95), previous: Math.round(baseRev * 0.82) }, { label: 'Jul', current: baseRev, previous: Math.round(baseRev * 0.85) },
    ];
    const newTenant: BusinessTenant = { ...business, id: newId, automations: defaultRoutines, revenueHistory: history };
    setTenants((prev) => [newTenant, ...prev]);
    setCurrentTenantId(newId);
  }, []);

  const updateTenant = useCallback((tenantId: string, patch: Partial<BusinessTenant>) => {
    setTenants((prev) => prev.map((t) => (t.id === tenantId ? { ...t, ...patch, id: t.id } : t)));
  }, []);

  const toggleAutomation = useCallback((automationId: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === currentTenantId) {
          return { ...t, automations: t.automations.map((a) => a.id === automationId ? { ...a, active: !a.active } : a) };
        }
        return t;
      })
    );
  }, [currentTenantId]);

  const formatCurrency = useCallback((amount: number): string => {
    return `${currentTenant.currencySymbol}${amount.toLocaleString()}`;
  }, [currentTenant.currencySymbol]);

  return (
    <TenantContext.Provider value={{
      currentTenant, tenants, switchTenant, registerBusiness, updateTenant, toggleAutomation,
      formatCurrency, isRegistrationOpen, setIsRegistrationOpen, activeFilterPeriod, setActiveFilterPeriod,
      siteSwitcherOpen, setSiteSwitcherOpen,
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within a TenantProvider');
  return context;
};
