import { clsx } from "clsx"

interface StatusBadgeProps {
  status: string
  size?: "sm" | "md"
}

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  live: { color: "text-status-live", bg: "bg-status-live/10", dot: "bg-status-live" },
  scheduled: { color: "text-status-scheduled", bg: "bg-status-scheduled/10", dot: "bg-status-scheduled" },
  draft: { color: "text-status-draft", bg: "bg-status-draft/10", dot: "bg-status-draft" },
  failed: { color: "text-status-failed", bg: "bg-status-failed/10", dot: "bg-status-failed" },
  published: { color: "text-status-published", bg: "bg-status-published/10", dot: "bg-status-published" },
  active: { color: "text-status-live", bg: "bg-status-live/10", dot: "bg-status-live" },
  new: { color: "text-status-scheduled", bg: "bg-status-scheduled/10", dot: "bg-status-scheduled" },
  hot: { color: "text-accent-orange", bg: "bg-accent-orange/10", dot: "bg-accent-orange" },
  warm: { color: "text-accent-gold", bg: "bg-accent-gold/10", dot: "bg-accent-gold" },
  cold: { color: "text-text-muted", bg: "bg-text-muted/10", dot: "bg-text-muted" },
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || statusConfig.draft
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1"

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full font-medium capitalize",
        config.color,
        config.bg,
        sizeClasses
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", config.dot)} />
      {status}
    </span>
  )
}
