import Link from 'next/link'
import { LogoutButton } from '@/components/dashboard/logout-button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-bg-surface border-r border-border-subtle p-4">
        <div className="mb-8">
          <h2 className="font-clash font-bold text-text-primary text-xl">ROSHANAL AI</h2>
          <p className="text-text-muted text-sm">Content Operator</p>
        </div>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">🏠 Dashboard</Link>
          <Link href="/dashboard/content" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">🧠 Content Brain</Link>
          <Link href="/dashboard/trends" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">📈 Trends</Link>
          <Link href="/dashboard/competitors" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">🕵️ Competitors</Link>
          <Link href="/dashboard/social" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">📱 Social Media</Link>
          <Link href="/dashboard/campaigns" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">📧 Campaigns</Link>
          <Link href="/dashboard/ugc" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">🎬 UGC Ads</Link>
          <Link href="/dashboard/products" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">📦 Products</Link>
          <Link href="/dashboard/analytics" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">📊 Analytics</Link>
          <Link href="/dashboard/settings" className="block py-2 px-3 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition">⚙️ Settings</Link>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8 bg-bg-void overflow-auto">
        {children}
      </main>
    </div>
  )
}
