'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, User, CheckCircle2, Settings as SettingsIcon, Bell, Lock, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useTenant } from '@/lib/context/TenantContext'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  avatar_url: string | null
  is_active: boolean
  last_login: string
  created_at: string
}

type SettingsTab = 'profile' | 'business' | 'preferences' | 'notifications'

interface Preferences {
  compact_view: boolean
  weekly_digest: boolean
}

interface NotificationSettings {
  whatsapp_alerts: boolean
  campaign_updates: boolean
  lead_alerts: boolean
}

const DEFAULT_PREFS: Preferences = { compact_view: false, weekly_digest: true }
const DEFAULT_NOTIFS: NotificationSettings = { whatsapp_alerts: true, campaign_updates: true, lead_alerts: true }

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) }
  } catch {
    return fallback
  }
}

export default function DashboardSettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  })
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS)
  const [notifs, setNotifs] = useState<NotificationSettings>(DEFAULT_NOTIFS)
  const [prefsSaved, setPrefsSaved] = useState('')
  const [notifsSaved, setNotifsSaved] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const { currentTenant, updateTenant } = useTenant()
  const [bizForm, setBizForm] = useState({
    name: '',
    industry: '',
    ownerName: '',
    ownerEmail: '',
    phone: '',
    currency: 'NGN',
    plan: 'Professional' as 'Starter' | 'Professional' | 'Business' | 'Enterprise' | 'Growth',
    productsSummary: '',
  })
  const [bizSaved, setBizSaved] = useState('')

  const fetchProfile = async (): Promise<void> => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data = await res.json() as { user: UserProfile } | UserProfile
      const user = 'user' in data ? data.user : data
      setProfile(user)
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchProfile()
    setPrefs(loadJson<Preferences>('roshanal_prefs', DEFAULT_PREFS))
    setNotifs(loadJson<NotificationSettings>('roshanal_notifs', DEFAULT_NOTIFS))
  }, [])

  useEffect(() => {
    setBizForm({
      name: currentTenant.name,
      industry: currentTenant.industry,
      ownerName: currentTenant.ownerName,
      ownerEmail: currentTenant.ownerEmail,
      phone: currentTenant.phone || '',
      currency: currentTenant.currency,
      plan: currentTenant.plan,
      productsSummary: currentTenant.productsSummary,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTenant.id])

  const handleSaveBusiness = (): void => {
    const symbol = bizForm.currency === 'USD' ? '$' : '₦'
    updateTenant(currentTenant.id, { ...bizForm, currencySymbol: symbol })
    setBizSaved(`Business details for ${bizForm.name} saved — they now appear across the whole dashboard.`)
    setTimeout(() => setBizSaved(''), 4000)
  }

  const handleSave = async (): Promise<void> => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      const token = localStorage.getItem('accessToken')

      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to update profile')

      setSuccess('Profile updated successfully!')
      await fetchProfile()

      if (formData.full_name) {
        localStorage.setItem('userName', formData.full_name)
      }

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePrefs = (): void => {
    localStorage.setItem('roshanal_prefs', JSON.stringify(prefs))
    setPrefsSaved('Preferences saved.')
    setTimeout(() => setPrefsSaved(''), 3000)
  }

  const handleSaveNotifs = (): void => {
    localStorage.setItem('roshanal_notifs', JSON.stringify(notifs))
    setNotifsSaved('Notification settings saved.')
    setTimeout(() => setNotifsSaved(''), 3000)
  }

  const handleChangePassword = async (): Promise<void> => {
    setPasswordMsg('')
    setPasswordError('')
    if (!passwordData.current || !passwordData.next || !passwordData.confirm) {
      setPasswordError('Fill in all three password fields.')
      return
    }
    if (passwordData.next.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (passwordData.next !== passwordData.confirm) {
      setPasswordError('New passwords do not match.')
      return
    }
    setPasswordSaving(true)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ current_password: passwordData.current, new_password: passwordData.next })
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error || 'Password change is not available yet — contact your admin.')
      setPasswordMsg('Password updated successfully.')
      setPasswordData({ current: '', next: '', confirm: '' })
      setShowPasswordForm(false)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setPasswordSaving(false)
    }
  }

  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: 'profile', label: 'Profile' },
    { id: 'business', label: 'Business' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'notifications', label: 'Notifications' },
  ]

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Business profile, preferences and notification controls."
        icon={SettingsIcon}
      />

      <div className="flex gap-1 p-1 bg-bg-surface border border-border-subtle rounded-lg mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[110px] px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-text-primary shadow-sm border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm mb-6">
          Error: {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-700 mb-6 flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      {activeTab === 'profile' && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-border-subtle p-6 space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-text-muted" />
                Profile Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                {profile && (
                  <div className="pt-2">
                    <Label>Role</Label>
                    <p className="mt-1 text-sm text-text-secondary capitalize">{profile.role}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border-subtle">
              <Button
                onClick={() => void handleSave()}
                disabled={saving}
                className="bg-accent-primary hover:bg-accent-primary/90 text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-border-subtle p-6 mt-6 space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">Account Information</h3>
              <div className="space-y-3">
                {profile && (
                  <>
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-text-secondary">User ID</span>
                      <span className="text-text-primary font-mono text-xs truncate">{profile.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Account Status</span>
                      <span className={`font-medium ${profile.is_active ? 'text-emerald-600' : 'text-red-600'}`}>
                        {profile.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-text-secondary">Last Login</span>
                      <span className="text-text-primary">
                        {profile.last_login ? new Date(profile.last_login).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Account Created</span>
                      <span className="text-text-primary">
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-border-subtle p-6 mt-6"
          >
            <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-text-muted" /> Security
            </h3>
            {!showPasswordForm ? (
              <Button
                onClick={() => setShowPasswordForm(true)}
                variant="outline"
              >
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                    {passwordError}
                  </div>
                )}
                {passwordMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-700 text-sm">
                    {passwordMsg}
                  </div>
                )}
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password (min 8 characters)</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.next}
                    onChange={(e) => setPasswordData({ ...passwordData, next: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => void handleChangePassword()}
                    disabled={passwordSaving}
                    className="bg-accent-primary hover:bg-accent-primary/90 text-white"
                  >
                    {passwordSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                  <Button onClick={() => { setShowPasswordForm(false); setPasswordError('') }} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}

      {activeTab === 'business' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-border-subtle p-6 space-y-6"
        >
          <div>
            <h3 className="text-lg font-medium text-text-primary mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-text-muted" /> Business Details
            </h3>
            <p className="text-xs text-text-secondary">
              Currently editing: <span className="font-semibold text-text-primary">{currentTenant.name}</span> ({currentTenant.plan} plan).
              Changes appear across the whole dashboard instantly.
            </p>
          </div>
          {bizSaved && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {bizSaved}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bizName">Business Name</Label>
              <Input id="bizName" value={bizForm.name} onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="bizIndustry">Industry</Label>
              <select
                id="bizIndustry"
                value={bizForm.industry}
                onChange={(e) => setBizForm({ ...bizForm, industry: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-border-subtle bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
              >
                {['Marine & Technology', 'Marine & Oil Gas', 'Healthcare & Clinics', 'Retail & Fashion', 'Security & Surveillance', 'Real Estate', 'Professional Services', 'Manufacturing', 'Education', 'Other'].map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="bizOwner">Owner Name</Label>
              <Input id="bizOwner" value={bizForm.ownerName} onChange={(e) => setBizForm({ ...bizForm, ownerName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="bizEmail">Owner Email</Label>
              <Input id="bizEmail" type="email" value={bizForm.ownerEmail} onChange={(e) => setBizForm({ ...bizForm, ownerEmail: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="bizPhone">Phone / WhatsApp</Label>
              <Input id="bizPhone" value={bizForm.phone} onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })} placeholder="0803..." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="bizCurrency">Currency</Label>
              <select
                id="bizCurrency"
                value={bizForm.currency}
                onChange={(e) => setBizForm({ ...bizForm, currency: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-border-subtle bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
              >
                <option value="NGN">NGN (₦ Naira)</option>
                <option value="USD">USD ($ Dollar)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Plan</Label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {(['Starter', 'Professional', 'Business', 'Enterprise'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setBizForm({ ...bizForm, plan: p })}
                    className={`py-2 rounded-lg text-sm font-semibold border transition ${bizForm.plan === p ? 'bg-accent-primary text-white border-accent-primary' : 'bg-white text-text-secondary border-border-subtle hover:border-border-hover'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="bizProducts">Products & Services Summary</Label>
              <textarea
                id="bizProducts"
                value={bizForm.productsSummary}
                onChange={(e) => setBizForm({ ...bizForm, productsSummary: e.target.value })}
                rows={3}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-border-subtle bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 resize-none"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-border-subtle">
            <Button onClick={handleSaveBusiness} className="bg-accent-primary hover:bg-accent-primary/90 text-white">
              <Save className="w-4 h-4 mr-2" /> Save Business Details
            </Button>
          </div>
        </motion.div>
      )}

      {activeTab === 'preferences' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-border-subtle p-6 space-y-6"
        >
          <h3 className="text-lg font-medium text-text-primary">Workspace Preferences</h3>
          {prefsSaved && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {prefsSaved}
            </div>
          )}
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span>
              <span className="block text-sm font-medium text-text-primary">Compact view</span>
              <span className="block text-xs text-text-secondary">Denser tables and cards on dashboard pages.</span>
            </span>
            <input
              type="checkbox"
              checked={prefs.compact_view}
              onChange={e => setPrefs({ ...prefs, compact_view: e.target.checked })}
              className="w-5 h-5 accent-[#1468F5]"
            />
          </label>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span>
              <span className="block text-sm font-medium text-text-primary">Weekly digest</span>
              <span className="block text-xs text-text-secondary">Email summary of reach, leads and campaigns every Monday.</span>
            </span>
            <input
              type="checkbox"
              checked={prefs.weekly_digest}
              onChange={e => setPrefs({ ...prefs, weekly_digest: e.target.checked })}
              className="w-5 h-5 accent-[#1468F5]"
            />
          </label>
          <div className="pt-4 border-t border-border-subtle">
            <Button onClick={handleSavePrefs} className="bg-accent-primary hover:bg-accent-primary/90 text-white">
              <Save className="w-4 h-4 mr-2" /> Save Preferences
            </Button>
          </div>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-border-subtle p-6 space-y-6"
        >
          <h3 className="text-lg font-medium text-text-primary flex items-center gap-2">
            <Bell className="w-5 h-5 text-text-muted" /> Notification Controls
          </h3>
          {notifsSaved && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {notifsSaved}
            </div>
          )}
          {(
            [
              { key: 'whatsapp_alerts', label: 'WhatsApp alerts', desc: 'Notify me about new inbound WhatsApp messages.' },
              { key: 'campaign_updates', label: 'Campaign updates', desc: 'Notify me when campaigns finish sending.' },
              { key: 'lead_alerts', label: 'Lead alerts', desc: 'Notify me when a hot lead is captured.' },
            ] as Array<{ key: keyof NotificationSettings; label: string; desc: string }>
          ).map(item => (
            <label key={item.key} className="flex items-center justify-between gap-4 cursor-pointer">
              <span>
                <span className="block text-sm font-medium text-text-primary">{item.label}</span>
                <span className="block text-xs text-text-secondary">{item.desc}</span>
              </span>
              <input
                type="checkbox"
                checked={notifs[item.key]}
                onChange={e => setNotifs({ ...notifs, [item.key]: e.target.checked })}
                className="w-5 h-5 accent-[#1468F5]"
              />
            </label>
          ))}
          <div className="pt-4 border-t border-border-subtle">
            <Button onClick={handleSaveNotifs} className="bg-accent-primary hover:bg-accent-primary/90 text-white">
              <Save className="w-4 h-4 mr-2" /> Save Notifications
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
