'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Key,
  Users,
  Package,
  Megaphone,
  Share2,
  Search,
  BarChart3,
  FileText,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
  Sparkles,
  ToggleRight
} from 'lucide-react'

const adminNavSections = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Admin Overview', href: '/admin' },
    ]
  },
  {
    label: 'Management',
    items: [
      { icon: Key, label: 'API Keys', href: '/admin/api-keys' },
      { icon: Users, label: 'Users', href: '/admin/users' },
      { icon: Package, label: 'Products', href: '/admin/products' },
      { icon: Megaphone, label: 'Campaigns', href: '/admin/campaigns' },
      { icon: Share2, label: 'Social Accounts', href: '/admin/social-accounts' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { icon: Search, label: 'Competitors', href: '/admin/competitors' },
      { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
      { icon: FileText, label: 'Audit Logs', href: '/admin/audit-logs' },
    ]
  },
  {
    label: 'System',
    items: [
      { icon: ToggleRight, label: 'Feature Toggles', href: '/admin/feature-toggles' },
      { icon: Settings, label: 'Settings', href: '/admin/settings' },
    ]
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState('Admin')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const name = localStorage.getItem('userName')
    const role = localStorage.getItem('userRole')
    if (!token) {
      router.push('/login')
      return
    }
    if (role !== 'admin') {
      router.push('/dashboard')
      return
    }
    if (name) setUserName(name)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-void flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-purple rounded-xl flex items-center justify-center animate-pulse">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-clash text-lg font-bold text-text-primary">Loading...</span>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-bg-void flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-border-subtle flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border-ghost">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-accent-primary to-accent-purple rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-clash text-lg font-bold text-text-primary">Admin</span>
                <p className="text-xs text-text-muted">Roshanal AI</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-text-muted hover:text-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {adminNavSections.map((section) => (
            <div key={section.label}>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-accent-primary/10 text-accent-primary'
                          : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border-ghost">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-accent-primary/10 rounded-full flex items-center justify-center text-accent-primary font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
              <p className="text-xs text-accent-primary font-medium">Administrator</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-accent-red/10 hover:text-accent-red transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-border-subtle px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-text-muted hover:text-text-secondary"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Shield className="w-4 h-4 text-accent-primary" />
            <span className="font-medium text-accent-primary">Admin Panel</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 w-full overflow-x-auto p-6 lg:p-8">
          <div className="min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
