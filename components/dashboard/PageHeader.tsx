import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  icon?: LucideIcon
  actions?: ReactNode
}

/**
 * Shared premium page header for all dashboard pages.
 * Every page states its eyebrow (section), title (what it is),
 * description (what it's for), and optional action buttons.
 */
export function PageHeader({ eyebrow, title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2">
          {Icon && (
            <span className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4" />
            </span>
          )}
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-primary">{eyebrow}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">{title}</h1>
        <p className="text-sm text-text-secondary mt-1.5 max-w-2xl">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}
