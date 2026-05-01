import * as React from "react"
import { clsx } from "clsx"

const statusColors = {
  live: "bg-status-live/10 text-status-live border-status-live/20",
  scheduled: "bg-status-scheduled/10 text-status-scheduled border-status-scheduled/20",
  draft: "bg-status-draft/10 text-status-draft border-status-draft/20",
  failed: "bg-status-failed/10 text-status-failed border-status-failed/20",
  published: "bg-status-published/10 text-status-published border-status-published/20",
  active: "bg-status-live/10 text-status-live border-status-live/20",
  new: "bg-status-scheduled/10 text-status-scheduled border-status-scheduled/20",
  hot: "bg-accent-orange/10 text-accent-orange border-accent-orange/20",
  warm: "bg-status-draft/10 text-status-draft border-status-draft/20",
  cold: "bg-text-muted/10 text-text-muted border-text-muted/20",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string
  variant?: "default" | "success" | "warning" | "error" | "info"
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, status, variant = "default", ...props }, ref) => {
    const colorClass = status
      ? statusColors[status as keyof typeof statusColors] || statusColors.draft
      : variant === "success"
        ? statusColors.live
        : variant === "warning"
          ? statusColors.draft
          : variant === "error"
            ? statusColors.failed
            : variant === "info"
              ? statusColors.scheduled
              : statusColors.draft

    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
          colorClass,
          className
        )}
        {...props}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {props.children as React.ReactNode}
      </span>
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
