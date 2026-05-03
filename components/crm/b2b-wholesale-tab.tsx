'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, DollarSign, TrendingUp, Users, Send, Calendar, FileText, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';

interface B2BAccount {
  id: string;
  company: string;
  contact: string;
  division: string;
  value: number;
  lastOrder: string;
}

interface B2BKPIs {
  totalAccounts: number;
  totalValue: number;
  avgDealSize: number;
  activeAccounts: number;
}

interface B2BWholesaleTabProps {
  accounts: B2BAccount[];
  b2bKPIs: B2BKPIs;
  onSendQuote: () => void;
  onScheduleDemo: () => void;
  onSendCatalog: () => void;
}

const defaultAccounts: B2BAccount[] = [
  { id: '1', company: 'Nigerian National Petroleum Corp', contact: 'Engr. Adebayo', division: 'Marine', value: 12500000, lastOrder: '2026-04-15' },
  { id: '2', company: 'TotalEnergies Nigeria Ltd', contact: 'Mrs. Chioma Okafor', division: 'Marine', value: 8700000, lastOrder: '2026-04-20' },
  { id: '3', company: 'Shell Petroleum Dev. Co.', contact: 'Mr. Ibrahim Tukur', division: 'Tech', value: 15200000, lastOrder: '2026-04-10' },
  { id: '4', company: 'Rivers State Govt. House', contact: 'Dr. Ngozi Okonkwo', division: 'Tech', value: 6300000, lastOrder: '2026-03-28' },
  { id: '5', company: 'NDDC HQ Port Harcourt', contact: 'Chief Samuel Worgu', division: 'Marine', value: 9800000, lastOrder: '2026-04-18' },
  { id: '6', company: 'Lagos Deep Sea Port', contact: 'Mr. Tunde Adeleke', division: 'Marine', value: 11200000, lastOrder: '2026-04-05' },
];

const B2BWholesaleTab: React.FC<B2BWholesaleTabProps & { onAddAccount?: () => void; onEditAccount?: (id: string) => void; onDeleteAccount?: (id: string) => void }> = ({
  accounts,
  b2bKPIs,
  onSendQuote,
  onScheduleDemo,
  onSendCatalog,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
}) => {
  const displayAccounts = accounts.length > 0 ? accounts : defaultAccounts;

  const kpiCards = [
    { label: 'Total Accounts', value: b2bKPIs.totalAccounts, icon: Building2, color: 'blue', prefix: '', suffix: '' },
    { label: 'Total B2B Value', value: b2bKPIs.totalValue, icon: DollarSign, color: 'emerald', prefix: '₦', suffix: '' },
    { label: 'Avg Deal Size', value: b2bKPIs.avgDealSize, icon: TrendingUp, color: 'purple', prefix: '₦', suffix: '' },
    { label: 'Active Accounts', value: b2bKPIs.activeAccounts, icon: Users, color: 'orange', prefix: '', suffix: '' },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${colorClasses[kpi.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpi.prefix}
                {typeof kpi.value === 'number'
                  ? kpi.value >= 1000000
                    ? `${(kpi.value / 1000000).toFixed(1)}M`
                    : kpi.value.toLocaleString()
                  : kpi.value}
                {kpi.suffix}
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">B2B Accounts</h3>
          {onAddAccount && (
            <button onClick={onAddAccount} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Add B2B Account
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-6 font-medium text-gray-600">Company Name</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Contact</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Division</th>
                <th className="text-right py-3 px-6 font-medium text-gray-600">Value</th>
                <th className="text-left py-3 px-6 font-medium text-gray-600">Last Order</th>
                <th className="text-right py-3 px-6 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayAccounts.map((account, i) => (
                <tr key={account.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="py-3 px-6 font-medium text-gray-900">{account.company}</td>
                  <td className="py-3 px-6 text-gray-700">{account.contact}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        account.division === 'Marine'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      {account.division}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right font-semibold text-gray-900">
                    ₦{(account.value / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-3 px-6 text-gray-600">{new Date(account.lastOrder).toLocaleDateString('en-GB')}</td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onEditAccount && (
                        <button onClick={() => onEditAccount(account.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteAccount && (
                        <button onClick={() => onDeleteAccount(account.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wholesale Pricing Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">TIER 1</span>
              <span className="text-2xl font-bold text-gray-900">5%</span>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">₦500K+ total spend</p>
            <p className="text-xs text-gray-600">5% discount on all orders</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">TIER 2</span>
              <span className="text-2xl font-bold text-gray-900">8%</span>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">₦1M+ total spend</p>
            <p className="text-xs text-gray-600">8% discount on all orders</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-emerald-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">TIER 3</span>
              <span className="text-2xl font-bold text-gray-900">12%</span>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">₦3M+ total spend</p>
            <p className="text-xs text-gray-600">12% discount + dedicated support</p>
          </div>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          Configure Pricing Tiers <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">B2B Campaign Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onSendQuote}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Bulk Quote
          </button>
          <button
            onClick={onScheduleDemo}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Schedule Demo Call
          </button>
          <button
            onClick={onSendCatalog}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Send Catalog
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default B2BWholesaleTab;
