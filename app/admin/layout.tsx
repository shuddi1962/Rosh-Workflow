import Link from 'next/link'
import { LogoutButton } from '@/components/admin/logout-button'
import {
  LayoutDashboard,
  Key,
  Users,
  Package,
  UserCheck,
  Mail,
  Smartphone,
  Search,
  BarChart3,
  FileText,
  Settings,
  ToggleLeft,
  Shield
} from 'lucide-react'

const navSections = [
  {
    title: 'MAIN',
    items: [
      { href: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
      { href: '/admin/api-keys', label: 'API Key Management', icon: Key },
      { href: '/admin/users', label: 'User Management', icon: Users }
    ]
  },
  {
    title: 'DATA',
    items: [
      { href: '/admin/products', label: 'Product Catalog', icon: Package },
      { href: '/admin/leads', label: 'Lead Management', icon: UserCheck },
      { href: '/admin/campaigns', label: 'Campaign Management', icon: Mail },
      { href: '/admin/social-accounts', label: 'Social Accounts', icon: Smartphone }
    ]
  },
  {
    title: 'INTEL',
    items: [
      { href: '/admin/competitors', label: 'Competitor Monitor', icon: Search },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText }
    ]
  },
  {
    title: 'SETTINGS',
    items: [
      { href: '/admin/settings', label: 'Business Settings', icon: Settings },
      { href: '/admin/feature-toggles', label: 'Platform Settings', icon: ToggleLeft }
    ]
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-clash font-bold text-gray-900 text-lg">Admin Panel</h2>
              <p className="text-gray-500 text-xs">ROSHANAL INFOTECH</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navSections.map((section, i) => (
            <div key={i}>
              <div className="text-gray-400 text-xs font-semibold mb-2 px-3 tracking-wide">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition group"
                  >
                    <item.icon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
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
