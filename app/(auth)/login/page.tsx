'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, Shield, Zap, Brain, TrendingUp } from 'lucide-react'

export default function LoginPage() {
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
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid credentials')
        return
      }

      router.push(data.user.role === 'admin' ? '/admin' : '/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#04060F] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0E1220] to-[#151B2E] p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.03&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1A56DB] to-[#3B82F6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-clash text-2xl font-bold text-[#F0F4FF]">Roshanal AI</span>
          </div>
          
          <h1 className="font-clash text-4xl font-bold text-[#F0F4FF] mb-4 leading-tight">
            Intelligent Business Growth Platform
          </h1>
          <p className="text-[#8B9CC8] text-lg leading-relaxed">
            AI-powered content generation, competitor intelligence, and social automation for Roshanal Infotech Limited, Port Harcourt.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 space-y-5"
        >
          {[
            { icon: Brain, text: 'AI Content Generation' },
            { icon: Shield, text: 'Competitor Intelligence' },
            { icon: Zap, text: 'Social Media Automation' },
            { icon: TrendingUp, text: 'Lead Generation & CRM' }
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-4 text-[#F0F4FF]">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-blue-400" />
              </div>
              <span className="font-medium">{feature.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 text-[#4A5475] text-sm space-y-1"
        >
          <p>No 18A Rumuola/Rumuadaolu Road, Port Harcourt, Rivers State</p>
          <p>08109522432 | info@roshanalinfotech.com</p>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1A56DB] to-[#3B82F6] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-clash text-xl font-bold text-[#F0F4FF]">Roshanal AI</span>
          </div>

          <div className="bg-[#0E1220] rounded-2xl border border-white/5 p-8 shadow-2xl shadow-black/20">
            <div className="mb-8">
              <h2 className="font-clash text-2xl font-bold text-[#F0F4FF] mb-2">Welcome back</h2>
              <p className="text-[#8B9CC8]">Sign in to access your dashboard</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#8B9CC8] mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A5475]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#151B2E] border border-white/10 rounded-xl text-[#F0F4FF] placeholder-[#4A5475] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="demo@roshanalinfotech.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8B9CC8] mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A5475]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-[#151B2E] border border-white/10 rounded-xl text-[#F0F4FF] placeholder-[#4A5475] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A5475] hover:text-[#8B9CC8] transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#1A56DB] to-[#3B82F6] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <p className="text-sm font-medium text-blue-300 mb-2">Demo Account</p>
              <div className="space-y-1 text-sm text-[#8B9CC8]">
                <p><span className="text-[#F0F4FF] font-medium">Email:</span> demo@roshanalinfotech.com</p>
                <p><span className="text-[#F0F4FF] font-medium">Password:</span> demo123456</p>
              </div>
            </div>

            <p className="mt-6 text-[#4A5475] text-sm text-center">
              Contact admin for account creation
            </p>
          </div>

          <p className="mt-8 text-center text-[#4A5475] text-sm">
            © 2026 Roshanal Infotech Limited. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
