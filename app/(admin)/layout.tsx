import Link from 'next/link'
import { LogoutButton } from '@/components/admin/logout-button'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-bg-surface border-r border-border-subtle p-4 flex flex-col">
        <div className="mb-6">
          <h2 className="font-clash font-bold text-text-primary text-xl">🔴 ADMIN PANEL</h2>
          <p className="text-text-muted text-xs">ROSHANAL INFOTECH</p>
        </div>
        
        <div className="text-text-muted text-xs font-semibold mb-2 px-3">MAIN</div>
        <nav className="space-y-1 mb-6">
          <Link href="/admin" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">🏠 Admin Overview</Link>
          <Link href="/admin/api-keys" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">🔑 API Key Management</Link>
          <Link href="/admin/users" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">👥 User Management</Link>
        </nav>
        
        <div className="text-text-muted text-xs font-semibold mb-2 px-3">DATA</div>
        <nav className="space-y-1 mb-6">
          <Link href="/admin/products" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">📦 Product Catalog</Link>
          <Link href="/admin/leads" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">👔 Lead Management</Link>
          <Link href="/admin/campaigns" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">📧 Campaign Management</Link>
          <Link href="/admin/social-accounts" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">📱 Social Accounts</Link>
        </nav>
        
        <div className="text-text-muted text-xs font-semibold mb-2 px-3">INTEL</div>
        <nav className="space-y-1 mb-6">
          <Link href="/admin/competitors" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">🕵️ Competitor Monitor</Link>
          <Link href="/admin/analytics" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">📊 Analytics</Link>
          <Link href="/admin/audit-logs" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">📋 Audit Logs</Link>
        </nav>
        
        <div className="text-text-muted text-xs font-semibold mb-2 px-3">SETTINGS</div>
        <nav className="space-y-1 mb-6">
          <Link href="/admin/settings" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">🌐 Business Settings</Link>
          <Link href="/admin/feature-toggles" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">🎛️ Platform Settings</Link>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-border-subtle">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8 bg-bg-void overflow-auto">
        {children}
      </main>
    </div>
  )
}
