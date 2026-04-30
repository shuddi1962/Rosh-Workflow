import Link from 'next/link'
import { LogoutButton } from '@/components/dashboard/logout-button'
import {
  LayoutDashboard,
  Brain,
  TrendingUp,
  Search,
  Share2,
  Mail,
  Video,
  Package,
  BarChart3,
  Settings,
  Sparkles
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/content', label: 'Content Brain', icon: Brain },
  { href: '/dashboard/trends', label: 'Trends', icon: TrendingUp },
  { href: '/dashboard/competitors', label: 'Competitors', icon: Search },
  { href: '/dashboard/social', label: 'Social Media', icon: Share2 },
  { href: '/dashboard/campaigns', label: 'Campaigns', icon: Mail },
  { href: '/dashboard/ugc', label: 'UGC Ads', icon: Video },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-clash font-bold text-gray-900 text-lg">Roshanal AI</h2>
              <p className="text-gray-500 text-xs">Content Operator</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition group"
            >
              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <LogoutButton />
        </div>
      </aside>
      
      <main className="flex-1 ml-64 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
