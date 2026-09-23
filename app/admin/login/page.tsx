'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'

// Dedicated admin console sign-in. Workspace users sign in at /login instead,
// so admins never have to log in as a user first to reach the admin panel.
export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const text = await res.text()
      let data: { error?: string; accessToken?: string; refreshToken?: string; user?: { role: string; full_name: string } } = {}
      try {
        data = text ? (JSON.parse(text) as typeof data) : {}
      } catch {
        throw new Error(`Server returned ${res.status} with an unreadable response. Please try again.`)
      }
      if (!res.ok) throw new Error(data.error || `Login failed (status ${res.status})`)
      if (!data.accessToken || !data.user) throw new Error('Login succeeded but the response was incomplete.')
      if (data.user.role !== 'admin') {
        throw new Error('This account is not an administrator. Workspace users should sign in at /login.')
      }
      localStorage.setItem('accessToken', data.accessToken)
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('userRole', data.user.role)
      localStorage.setItem('userName', data.user.full_name)
      window.location.href = '/admin'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-void flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-purple rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-clash text-2xl font-bold text-text-primary">Admin Console</p>
            <p className="text-xs text-text-muted">GrowPilot · administrators only</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border-subtle p-8 shadow-lg">
          <h2 className="font-clash text-xl font-bold text-text-primary mb-1">Administrator sign in</h2>
          <p className="text-sm text-text-secondary mb-6">Separate from the workspace login. Your admin session stays in /admin.</p>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-accent-red/10 border border-accent-red/20 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-accent-red flex-shrink-0" />
              <p className="text-accent-red text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Admin email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                  placeholder="admin@company.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all"
                  placeholder="Enter admin password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-accent-primary to-accent-purple text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Signing in...</>) : 'Sign in to admin console'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <button onClick={() => router.push('/login')} className="text-text-muted hover:text-text-primary">Workspace login →</button>
            <button onClick={() => router.push('/')} className="text-text-muted hover:text-text-primary">← Back to site</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
