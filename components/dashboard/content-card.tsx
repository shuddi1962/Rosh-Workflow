import { clsx } from "clsx"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Calendar, Share2 } from "lucide-react"

interface ContentCardProps {
  title: string
  description: string
  platform?: string
  status?: string
  scheduledAt?: string
  division?: string
  onClick?: () => void
}

export function ContentCard({ title, description, platform, status, scheduledAt, division, onClick }: ContentCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-bg-surface rounded-lg border border-border-subtle p-5 hover:border-border-hover transition-all duration-300 cursor-pointer group",
        division === "marine" && "hover:border-l-accent-primary",
        division === "tech" && "hover:border-l-accent-purple"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-text-primary font-medium group-hover:text-accent-primary-glow transition-colors">
            {title}
          </h3>
          <p className="text-text-muted text-sm mt-1 line-clamp-2">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        {platform && (
          <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-bg-elevated px-2 py-1 rounded">
            <Share2 className="w-3 h-3" />
            {platform}
          </span>
        )}
        {status && <StatusBadge status={status} size="sm" />}
        {scheduledAt && (
          <span className="inline-flex items-center gap-1 text-xs text-text-muted">
            <Calendar className="w-3 h-3" />
            {scheduledAt}
          </span>
        )}
      </div>
    </div>
  )
}
