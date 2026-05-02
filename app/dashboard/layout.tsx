'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Brain,
  TrendingUp,
  Search,
  Share2,
  Video,
  Megaphone,
  Users,
  Package,
  BarChart3,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
  Sparkles,
  Phone,
  Palette,
  UserPlus,
  FolderOpen,
  Image as ImageIcon,
} from 'lucide-react'

const sidebarGroups = [
  {
    label: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
      { icon: Brain, label: 'Content Brain', href: '/dashboard/content' },
      { icon: TrendingUp, label: 'Trends', href: '/dashboard/trends' },
      { icon: Search, label: 'Competitors', href: '/dashboard/competitors' },
    ]
  },
  {
    label: 'CRM',
    items: [
      { icon: UserPlus, label: 'Pipeline', href: '/dashboard/crm' },
      { icon: Users, label: 'Leads', href: '/dashboard/crm/leads' },
      { icon: FolderOpen, label: 'Qualification', href: '/dashboard/crm/qualification' },
    ]
  },
  {
    label: 'Marketing',
    items: [
      { icon: Share2, label: 'Social Media', href: '/dashboard/social' },
      { icon: Video, label: 'UGC Creator', href: '/dashboard/ugc' },
      { icon: Megaphone, label: 'Campaigns', href: '/dashboard/campaigns' },
    ]
  },
  {
    label: 'Creative Studio',
    items: [
      { icon: Palette, label: 'Video Studio', href: '/dashboard/creative/video' },
      { icon: ImageIcon, label: 'Banners', href: '/dashboard/creative/banners' },
      { icon: Search, label: 'URL Scraper', href: '/dashboard/creative/scraper' },
    ]
  },
  {
    label: 'Voice',
    items: [
      { icon: Phone, label: 'Agents', href: '/dashboard/voice/agents' },
      { icon: Phone, label: 'Calls', href: '/dashboard/voice/calls' },
    ]
  },
  {
    label: 'Products',
    items: [
      { icon: Package, label: 'Catalog', href: '/dashboard/products' },
      { icon: Package, label: 'Add Product', href: '/dashboard/products/add' },
    ]
  },
]

const sidebarItems = sidebarGroups.flatMap(g => g.items)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState('User')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const name = localStorage.getItem('userName')
    if (!token) {
      router.push('/login')
      return
    }
    if (name) setUserName(name)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-clash text-lg font-bold text-gray-900">Loading...</span>
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
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-clash text-lg font-bold text-gray-900">Roshanal AI</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500">Operator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Dashboard</span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
