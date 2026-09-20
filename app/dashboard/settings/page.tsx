'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, User, Mail, Phone, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

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

export default function DashboardSettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  })

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data = await res.json()
      const user = data.user || data
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
    fetchProfile()
  }, [])

  const handleSave = async () => {
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

      // Update local storage if name changed
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

  const handleChangePassword = async () => {
    // This would typically open a modal or navigate to a password change page
    alert('Password change functionality would be implemented here')
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-clash text-3xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-text-secondary">Manage your profile and account settings</p>
      </motion.div>

      {error && (
        <div className="bg-accent-red/5 border border-accent-red/20 rounded-lg p-4 text-accent-red mb-6">
          Error: {error}
        </div>
      )}

      {success && (
        <div className="bg-accent-emerald/5 border border-accent-emerald/20 rounded-lg p-4 text-accent-emerald mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

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
            onClick={handleSave}
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
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">User ID</span>
                  <span className="text-text-primary font-mono text-xs">{profile.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Account Status</span>
                  <span className={`font-medium ${profile.is_active ? 'text-accent-emerald' : 'text-accent-red'}`}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Last Login</span>
                  <span className="text-text-primary">
                    {profile.last_login ? new Date(profile.last_login).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Account Created</span>
                  <span className="text-text-primary">
                    {new Date(profile.created_at).toLocaleDateString()}
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
        <h3 className="text-lg font-medium text-text-primary mb-4">Security</h3>
        <Button
          onClick={handleChangePassword}
          variant="outline"
        >
          Change Password
        </Button>
      </motion.div>
    </div>
  )
}
