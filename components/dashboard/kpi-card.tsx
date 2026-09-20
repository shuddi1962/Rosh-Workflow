import { clsx } from "clsx"
import { LucideIcon } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down"
  icon: LucideIcon
  color?: "blue" | "emerald" | "purple" | "gold" | "red" | "orange"
}

const colorMap = {
  blue: "border-l-accent-primary bg-accent-primary/5",
  emerald: "border-l-accent-emerald bg-accent-emerald/5",
  purple: "border-l-accent-purple bg-accent-purple/5",
  gold: "border-l-accent-gold bg-accent-gold/5",
  red: "border-l-accent-red bg-accent-red/5",
  orange: "border-l-accent-orange bg-accent-orange/5",
}

const iconColorMap = {
  blue: "text-accent-primary-glow bg-accent-primary/10",
  emerald: "text-accent-emerald bg-accent-emerald/10",
  purple: "text-accent-purple bg-accent-purple/10",
  gold: "text-accent-gold bg-accent-gold/10",
  red: "text-accent-red bg-accent-red/10",
  orange: "text-accent-orange bg-accent-orange/10",
}

export function KPICard({ title, value, change, trend, icon: Icon, color = "blue" }: KPICardProps) {
  return (
    <div
      className={clsx(
        "bg-bg-surface rounded-lg border border-border-subtle border-l-4 p-6 hover:border-border-hover transition-all duration-300",
        colorMap[color]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", iconColorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <div
            className={clsx(
              "flex items-center gap-1 text-sm font-medium",
              trend === "up" ? "text-accent-emerald" : "text-accent-red"
            )}
          >
            {trend === "up" ? "↑" : "↓"} {change}
          </div>
        )}
      </div>
      <div className="font-mono text-2xl font-bold text-text-primary mb-1">{value}</div>
      <div className="text-text-muted text-sm">{title}</div>
    </div>
  )
}
