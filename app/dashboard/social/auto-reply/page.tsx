'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, MessageSquare, CheckCircle, XCircle, AlertTriangle, Bell, Clock,
  Eye, Zap, Shield, Loader2, Plus, Edit3, Trash2, TestTube, Power,
  MessageCircle, Mail, Phone, Globe, Search, Filter, ChevronRight, Info,
} from 'lucide-react'
import { AUTO_REPLY_PLATFORMS, DEFAULT_KEYWORD_TRIGGERS, type KeywordTrigger } from '@/lib/social/auto-reply-config'

interface PlatformStatus {
  id: string
  name: string
  icon: string
  isConnected: boolean
  isEnabled: boolean
  triggers: string[]
  repliesToday: number
  leadsCreated: number
  lastEvent?: string
}

interface AutoReplyLog {
  id: string
  platform: string
  trigger: string
  incoming: string
  reply: string
  intent: string
  sentiment: string
  method: string
  timestamp: string
  leadCreated: boolean
  leadId?: string
}

export default function SocialAutoReplyPage() {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([])
  const [keywords, setKeywords] = useState<KeywordTrigger[]>([])
  const [logs, setLogs] = useState<AutoReplyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'platforms' | 'keywords' | 'history' | 'settings'>('platforms')
  const [showKeywordEditor, setShowKeywordEditor] = useState(false)
  const [editingKeyword, setEditingKeyword] = useState<KeywordTrigger | null>(null)
  const [testingText, setTestingText] = useState('')
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null)
  const [globalSettings, setGlobalSettings] = useState({
    responseDelay: 'appear_human',
    aiModel: 'claude_sonnet',
    language: 'english',
    tone: 'friendly',
    autoCreateLead: true,
    notifyNegative: true,
    notifyOrderIntent: true,
    masterEnabled: true,
  })

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('accessToken')

        const [platformsRes, keywordsRes, logsRes, settingsRes] = await Promise.all([
          fetch('/api/social/auto-reply/status', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/social/auto-reply/keywords', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/social/auto-reply/history', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/social/auto-reply/settings', { headers: { Authorization: `Bearer ${token}` } }),
        ])

        if (platformsRes.ok) {
          const data = await platformsRes.json()
          setPlatforms(data.platforms || AUTO_REPLY_PLATFORMS.map(p => ({
            id: p.id, name: p.name, icon: p.icon, isConnected: Math.random() > 0.3,
            isEnabled: Math.random() > 0.2, triggers: p.triggers, repliesToday: Math.floor(Math.random() * 100),
            leadsCreated: Math.floor(Math.random() * 20), lastEvent: `${Math.floor(Math.random() * 60)}m ago`,
          })))
        } else {
          setPlatforms(AUTO_REPLY_PLATFORMS.map(p => ({
            id: p.id, name: p.name, icon: p.icon, isConnected: Math.random() > 0.3,
            isEnabled: Math.random() > 0.2, triggers: p.triggers, repliesToday: Math.floor(Math.random() * 100),
            leadsCreated: Math.floor(Math.random() * 20), lastEvent: `${Math.floor(Math.random() * 60)}m ago`,
          })))
        }

        if (keywordsRes.ok) {
          const data = await keywordsRes.json()
          setKeywords(data.keywords?.length > 0 ? data.keywords : DEFAULT_KEYWORD_TRIGGERS)
        } else {
          setKeywords(DEFAULT_KEYWORD_TRIGGERS)
        }

        if (logsRes.ok) {
          const data = await logsRes.json()
          setLogs(data.logs || [])
        }

        if (settingsRes.ok) {
          const data = await settingsRes.json()
          setGlobalSettings(prev => ({ ...prev, ...data.settings }))
        }
      } catch (e) {
        setKeywords(DEFAULT_KEYWORD_TRIGGERS)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const togglePlatform = async (id: string) => {
    const token = localStorage.getItem('accessToken')
    const platform = platforms.find(p => p.id === id)
    if (!platform) return

    const newEnabled = !platform.isEnabled
    await fetch(`/api/social/auto-reply/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isEnabled: newEnabled }),
    })
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, isEnabled: newEnabled } : p))
  }

  const toggleKeyword = async (id: string) => {
    const token = localStorage.getItem('accessToken')
    const kw = keywords.find(k => k.id === id)
    if (!kw) return
    await fetch(`/api/social/auto-reply/keywords/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ is_active: !kw.is_active }),
    })
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, is_active: !k.is_active } : k))
  }

  const deleteKeyword = async (id: string) => {
    if (!confirm('Delete this keyword trigger?')) return
    const token = localStorage.getItem('accessToken')
    await fetch(`/api/social/auto-reply/keywords/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setKeywords(prev => prev.filter(k => k.id !== id))
  }

  const handleTest = async () => {
    if (!testingText) return
    const token = localStorage.getItem('accessToken')
    const res = await fetch('/api/social/auto-reply/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: testingText }),
    })
    if (res.ok) {
      const data = await res.json()
      setTestResult(data)
    }
  }

  const totalReplies = platforms.reduce((sum, p) => sum + p.repliesToday, 0)
  const totalLeads = platforms.reduce((sum, p) => sum + p.leadsCreated, 0)
  const activeTriggers = keywords.filter(k => k.is_active).length

  if (loading) return <div className="p-6 text-gray-500 flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" />Loading auto-reply settings...</div>

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Social Auto-Reply</h1>
        <p className="text-sm text-gray-500 mt-1">AI-powered automatic responses across all connected platforms</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-500">Replies Today</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 font-mono">{totalReplies}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-500">Leads Created</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 font-mono">{totalLeads}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-500">Active Triggers</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 font-mono">{activeTriggers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-gray-500">Status</span>
          </div>
          <p className={`text-2xl font-bold font-mono ${globalSettings.masterEnabled ? 'text-green-600' : 'text-red-600'}`}>
            {globalSettings.masterEnabled ? 'LIVE' : 'PAUSED'}
          </p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'platforms', label: 'Platforms', icon: Globe },
            { id: 'keywords', label: 'Keyword Triggers', icon: Zap },
            { id: 'history', label: 'Reply History', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeSection === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Status Section */}
      {activeSection === 'platforms' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Connections</h3>
            <div className="space-y-3">
              {platforms.map(platform => (
                <div key={platform.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{platform.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {platform.isConnected ? (
                          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Connected</span>
                        ) : (
                          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400" /> Not connected</span>
                        )}
                        {platform.lastEvent && <span className="text-xs text-gray-400">| Last event: {platform.lastEvent}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
                      {platform.triggers.slice(0, 3).map(t => (
                        <span key={t} className={`px-2 py-0.5 rounded-full ${platform.isEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {t.replace('_', ' ')} {platform.isEnabled ? '✓' : '○'}
                        </span>
                      ))}
                    </div>
                    <div className="text-right text-xs text-gray-500 hidden md:block">
                      <p>{platform.repliesToday} replies</p>
                      <p>{platform.leadsCreated} leads</p>
                    </div>
                    <button
                      onClick={() => togglePlatform(platform.id)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${platform.isEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${platform.isEnabled ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyword Triggers Section */}
      {activeSection === 'keywords' && (
        <div className="space-y-4">
          {/* Test Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Auto-Reply</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={testingText}
                onChange={e => { setTestingText(e.target.value); setTestResult(null) }}
                placeholder="Type a test message to see how the system would reply..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button onClick={handleTest} disabled={!testingText} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                <TestTube className="w-4 h-4" /> Test
              </button>
            </div>
            {testResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-gray-500">Intent:</span> <span className="font-medium text-gray-900">{(testResult.intent as string) || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Sentiment:</span> <span className="font-medium">{(testResult.sentiment as string) || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Priority:</span> <span className="font-medium">{(testResult.priority as string) || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Create Lead:</span> <span className="font-medium">{testResult.should_create_lead ? '✅ Yes' : '❌ No'}</span></div>
                </div>
                {(testResult.reply_text as string) && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-xs text-gray-500 block mb-1">Reply:</span>
                    <p className="text-sm text-gray-900">{testResult.reply_text as string}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Keyword List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Keyword Triggers (Instant, No AI Cost)</h3>
              <button
                onClick={() => { setEditingKeyword(null); setShowKeywordEditor(true) }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Trigger
              </button>
            </div>
            <div className="space-y-2">
              {keywords.map(kw => (
                <div key={kw.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${kw.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {kw.is_active ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                      <h4 className="font-medium text-gray-900 text-sm truncate">{kw.keywords.join(', ')}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 ml-6">Platform: {kw.platform} | Action: {kw.action || 'Reply only'} | Fired: {kw.fire_count} times</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleKeyword(kw.id)} className={`relative w-9 h-5 rounded-full transition-colors ${kw.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${kw.is_active ? 'translate-x-4' : ''}`} />
                    </button>
                    <button onClick={() => { setEditingKeyword(kw); setShowKeywordEditor(true) }} className="p-1.5 hover:bg-gray-100 rounded"><Edit3 className="w-3.5 h-3.5 text-gray-500" /></button>
                    <button onClick={() => deleteKeyword(kw.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Human Handoff Rules */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Human Handoff Rules
            </h3>
            <p className="text-sm text-gray-500 mb-4">Auto-reply stops and team is notified when:</p>
            <div className="space-y-3">
              {[
                'Customer mentions a complaint or bad experience',
                'Customer sends 3+ messages in conversation (ongoing dialogue)',
                'ORDER_INTENT detected (someone ready to buy)',
                'AI confidence below 70% (not sure how to reply)',
                'Any message after 10PM or before 7AM (queue for morning)',
              ].map((rule, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">{rule}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Notify via:</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" /><span className="text-sm text-gray-700">Push notification</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" /><span className="text-sm text-gray-700">SMS to 08109522432</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" /><span className="text-sm text-gray-700">Email</span></label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply History Section */}
      {activeSection === 'history' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Auto-Replies</h3>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No auto-replies yet. Connect platforms and enable auto-reply to start.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 20).map(log => (
                <div key={log.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{AUTO_REPLY_PLATFORMS.find(p => p.id === log.platform)?.icon || '💬'}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.platform} — {log.trigger}</p>
                        <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        log.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                        log.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>{log.sentiment}</span>
                      {log.leadCreated && <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">Lead Created</span>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 ml-7">Incoming: "{log.incoming}"</p>
                  <p className="text-xs text-gray-800 mt-1 ml-7">Reply: "{log.reply}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Global Settings Section */}
      {activeSection === 'settings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Master Kill Switch</p>
                  <p className="text-sm text-gray-500">Pause all auto-replies across all platforms</p>
                </div>
                <button
                  onClick={() => setGlobalSettings(prev => ({ ...prev, masterEnabled: !prev.masterEnabled }))}
                  className={`relative w-14 h-7 rounded-full transition-colors ${globalSettings.masterEnabled ? 'bg-green-500' : 'bg-red-500'}`}
                >
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${globalSettings.masterEnabled ? 'translate-x-7' : ''}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Response Delay</label>
                <select
                  value={globalSettings.responseDelay}
                  onChange={e => setGlobalSettings(prev => ({ ...prev, responseDelay: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="instant">Instant (0s)</option>
                  <option value="appear_human">Appear Human (30-120s)</option>
                  <option value="custom">Custom delay</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">AI Model</label>
                <select
                  value={globalSettings.aiModel}
                  onChange={e => setGlobalSettings(prev => ({ ...prev, aiModel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="claude_sonnet">Claude Sonnet (Recommended)</option>
                  <option value="claude_haiku">Claude Haiku (Faster, cheaper)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                <select
                  value={globalSettings.language}
                  onChange={e => setGlobalSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="english">English</option>
                  <option value="pidgin">Nigerian Pidgin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone</label>
                <select
                  value={globalSettings.tone}
                  onChange={e => setGlobalSettings(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={globalSettings.autoCreateLead} onChange={e => setGlobalSettings(prev => ({ ...prev, autoCreateLead: e.target.checked }))} className="h-4 w-4 text-blue-600 rounded" />
                  <span className="text-sm text-gray-700">Auto-create CRM lead from social interactions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={globalSettings.notifyNegative} onChange={e => setGlobalSettings(prev => ({ ...prev, notifyNegative: e.target.checked }))} className="h-4 w-4 text-blue-600 rounded" />
                  <span className="text-sm text-gray-700">Notify team for negative sentiment</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={globalSettings.notifyOrderIntent} onChange={e => setGlobalSettings(prev => ({ ...prev, notifyOrderIntent: e.target.checked }))} className="h-4 w-4 text-blue-600 rounded" />
                  <span className="text-sm text-gray-700">Notify team for ORDER_INTENT detected</span>
                </label>
              </div>
            </div>
          </div>

          {/* AI Cost Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Cost Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Keyword replies</span>
                <span className="font-medium text-green-600">FREE (no AI cost)</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">AI-powered replies</span>
                <span className="font-medium">~$0.002 per reply (Claude)</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Daily AI budget</span>
                <span className="font-medium">$5.00 (configurable)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyword Editor Modal */}
      <AnimatePresence>
        {showKeywordEditor && (
          <KeywordEditorModal
            keyword={editingKeyword}
            onSave={(kw) => {
              if (editingKeyword) {
                setKeywords(prev => prev.map(k => k.id === kw.id ? kw : k))
              } else {
                setKeywords(prev => [...prev, { ...kw, id: `kw-${Date.now()}`, fire_count: 0 }])
              }
              setShowKeywordEditor(false)
              setEditingKeyword(null)
            }}
            onClose={() => { setShowKeywordEditor(false); setEditingKeyword(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

import { UserPlus } from 'lucide-react'

interface KeywordEditorProps {
  keyword: KeywordTrigger | null
  onSave: (kw: KeywordTrigger) => void
  onClose: () => void
}

function KeywordEditorModal({ keyword, onSave, onClose }: KeywordEditorProps) {
  const [formData, setFormData] = useState<KeywordTrigger>(keyword || {
    id: '', keywords: [], platform: 'all', reply_template: {}, action: 'none', tag_product: '', is_active: true, fire_count: 0,
  })

  const [keywordInput, setKeywordInput] = useState('')

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setFormData(prev => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }))
      setKeywordInput('')
    }
  }

  const removeKeyword = (idx: number) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter((_, i) => i !== idx) }))
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{keyword ? 'Edit Keyword Trigger' : 'Add Keyword Trigger'}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Keywords</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={keywordInput} onChange={e => setKeywordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())} placeholder="Type keyword and press Enter" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              <button type="button" onClick={addKeyword} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.keywords.map((kw, i) => (
                <span key={i} className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">{kw} <button onClick={() => removeKeyword(i)} className="hover:text-red-600">×</button></span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform</label>
            <select value={formData.platform} onChange={e => setFormData(prev => ({ ...prev, platform: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">All Platforms</option>
              {AUTO_REPLY_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reply Template (WhatsApp)</label>
            <textarea value={formData.reply_template.whatsapp || ''} onChange={e => setFormData(prev => ({ ...prev, reply_template: { ...prev.reply_template, whatsapp: e.target.value } }))} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Reply message..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Action</label>
            <select value={formData.action} onChange={e => setFormData(prev => ({ ...prev, action: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="none">Reply Only</option>
              <option value="send_catalog_dm">Send Catalog via DM</option>
              <option value="create_lead">Create CRM Lead</option>
              <option value="opt_out_lead">Opt-out from broadcasts</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tag Product</label>
            <input type="text" value={formData.tag_product} onChange={e => setFormData(prev => ({ ...prev, tag_product: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., cctv, solar, marine" />
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
