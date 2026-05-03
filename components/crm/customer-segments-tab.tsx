'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, RefreshCw, AlertTriangle, UserPlus, Building2, Wrench, ChevronRight } from 'lucide-react';

interface Segment {
  id: string;
  label: string;
  sublabel: string;
  count: number;
  avgOrder: number;
  icon: string;
  color: string;
  action: string;
}

interface CustomerSegmentsTabProps {
  segments: Segment[];
  onLaunchCampaign: (segmentId: string) => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Crown,
  RefreshCw,
  AlertTriangle,
  UserPlus,
  Building2,
  Wrench,
};

const colorMap: Record<string, { bg: string; text: string; border: string; button: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', button: 'bg-blue-600 hover:bg-blue-700' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', button: 'bg-green-600 hover:bg-green-700' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', button: 'bg-red-600 hover:bg-red-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', button: 'bg-emerald-600 hover:bg-emerald-700' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', button: 'bg-purple-600 hover:bg-purple-700' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', button: 'bg-orange-600 hover:bg-orange-700' },
};

const CustomerSegmentsTab: React.FC<CustomerSegmentsTabProps> = ({ segments, onLaunchCampaign }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((segment, index) => {
          const IconComponent = iconMap[segment.icon] || Building2;
          const colors = colorMap[segment.color] || colorMap.blue;

          return (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white border ${colors.border} rounded-xl p-5 relative group hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 ${colors.bg} rounded-lg`}>
                  <IconComponent className={`w-5 h-5 ${colors.text}`} />
                </div>
                <span className={`text-3xl font-bold text-gray-900 leading-none`}>
                  {segment.count.toLocaleString()}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1">{segment.label}</h3>
              <p className="text-xs text-gray-500 mb-3">{segment.sublabel}</p>

              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-500">customers</span>
                <span className={`text-sm font-semibold ${colors.text}`}>
                  ₦{segment.avgOrder.toLocaleString()} avg order
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onLaunchCampaign(segment.id)}
                  className={`px-4 py-2 ${colors.button} text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
                >
                  {segment.action} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">AI Segment Insights</h3>
            <p className="text-sm text-blue-100 mb-4">
              Your "At Risk" segment has 23 customers who haven't ordered in 90+ days. The average re-engagement
              rate for this segment is 18% when using personalized WhatsApp campaigns with special discount offers.
              Consider launching a targeted re-engagement campaign with a 10% discount incentive to win them back.
            </p>
            <button
              onClick={() => onLaunchCampaign('at-risk')}
              className="px-5 py-2.5 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              Launch Re-engagement Campaign <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerSegmentsTab;
