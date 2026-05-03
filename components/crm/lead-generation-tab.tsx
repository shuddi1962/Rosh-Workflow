'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Target, Phone, History, MapPin, ChevronRight, Play } from 'lucide-react';

interface LeadGenerationTabProps {
  onScrape: (config: Record<string, unknown>) => void;
  history: Array<{ timestamp: string; source: string; query: string; count: number }>;
}

const LeadGenerationTab: React.FC<LeadGenerationTabProps> = ({ onScrape, history }) => {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('Google Maps');

  const quickAreas = ['GRA PH', 'Trans Amadi', 'Rumuola', 'Yenegoa', 'Warri', 'All Niger Delta'];

  const handleScrape = () => {
    onScrape({ keywords, location, source });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Lead Scraping</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., oil companies, security firms, hotels"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Lagos, Port Harcourt"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Areas</label>
              <div className="flex flex-wrap gap-2">
                {quickAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => setLocation(area)}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors text-gray-700"
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option>Google Maps</option>
                <option>LinkedIn</option>
                <option>Instagram</option>
                <option>Facebook</option>
              </select>
            </div>

            <button
              onClick={handleScrape}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Scrape Leads
            </button>

            <p className="text-xs text-gray-500 text-center">Results appear in Pipeline as New Leads</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Lead Scoring</h3>
          </div>

          <p className="text-sm text-gray-600 mb-4">Leads are automatically scored 0-100 based on:</p>

          <ul className="space-y-2 mb-6">
            {[
              'Company size & revenue',
              'Industry match',
              'Website engagement',
              'Email open rate',
              'Social signals',
              'Purchase intent signals',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                {item}
              </li>
            ))}
          </ul>

          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Score Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">A (80-100): Hot lead</span>
                <span className="text-lg">🔥</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">B (60-79): Warm lead</span>
                <span className="text-lg">🌡</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">C (40-59): Cold lead</span>
                <span className="text-lg">🌨</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">D (0-39): Disqualified</span>
                <span className="text-lg">❄️</span>
              </div>
            </div>
          </div>

          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            Configure Scoring <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Outreach Automation</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">Email Sequence</h4>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
            </div>
            <p className="text-xs text-gray-600 mb-2">5-step drip campaign</p>
            <p className="text-xs text-gray-500 mb-3">234 sent this month</p>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Configure <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">WhatsApp</h4>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
            </div>
            <p className="text-xs text-gray-600 mb-2">Personalized follow-ups</p>
            <p className="text-xs text-gray-500 mb-3">89 sent this month</p>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Configure <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">AI Phone Calls</h4>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Inactive</span>
            </div>
            <p className="text-xs text-gray-600 mb-2">ElevenLabs AI Outbound calls</p>
            <p className="text-xs text-gray-500 mb-3">12 this month</p>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Activate <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <span className="text-lg">+</span> SMS Campaign
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <span className="text-lg">+</span> Voice Broadcast
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <span className="text-lg">+</span> Social DM Automation
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-gray-200 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <History className="w-5 h-5 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Scraping History</h3>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No scraping history yet. Start scraping to see results here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Timestamp</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Source</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Query</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Count</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-700">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-3 text-gray-700">{entry.source}</td>
                    <td className="py-2 px-3 text-gray-700">{entry.query}</td>
                    <td className="py-2 px-3 text-right font-medium text-gray-900">{entry.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LeadGenerationTab;
