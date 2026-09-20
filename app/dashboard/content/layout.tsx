'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { clsx } from 'clsx'

const subNav = [
  { label: 'Overview', href: '/dashboard/content' },
  { label: 'Ideas', href: '/dashboard/content/ideas' },
  { label: 'Calendar', href: '/dashboard/content/calendar' },
]

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Content Brain</h1>
        <p className="text-sm text-text-secondary">AI-powered content generation and management</p>
        <div className="flex gap-1 mt-4 bg-bg-surface rounded-lg p-1 w-fit">
          {subNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'px-4 py-2 text-sm font-medium rounded-md transition-all',
                  isActive
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/50'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
      {children}
    </div>
  )
}
