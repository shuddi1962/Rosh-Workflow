import { BarChart3, Send, CheckCircle2, AlertCircle, Eye, MousePointer } from "lucide-react"

interface CampaignStatsProps {
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    responded: number
    failed: number
  }
}

export function CampaignStats({ stats }: CampaignStatsProps) {
  const deliveryRate = stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(1) : "0"
  const openRate = stats.delivered > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(1) : "0"
  const clickRate = stats.opened > 0 ? ((stats.clicked / stats.opened) * 100).toFixed(1) : "0"

  const metrics = [
    { label: "Sent", value: stats.sent, icon: Send, color: "text-accent-primary-glow" },
    { label: "Delivered", value: stats.delivered, icon: CheckCircle2, color: "text-accent-emerald" },
    { label: "Opened", value: stats.opened, icon: Eye, color: "text-accent-purple" },
    { label: "Clicked", value: stats.clicked, icon: MousePointer, color: "text-accent-gold" },
    { label: "Responded", value: stats.responded, icon: BarChart3, color: "text-accent-primary-glow" },
    { label: "Failed", value: stats.failed, icon: AlertCircle, color: "text-accent-red" },
  ]

  return (
    <div className="bg-bg-surface rounded-lg border border-border-subtle p-6">
      <h3 className="font-clash text-lg font-semibold text-text-primary mb-4">Campaign Performance</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center">
            <metric.icon className={`w-6 h-6 mx-auto mb-2 ${metric.color}`} />
            <p className="font-mono text-xl font-bold text-text-primary">{metric.value}</p>
            <p className="text-xs text-text-muted">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border-subtle">
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-accent-emerald">{deliveryRate}%</p>
          <p className="text-xs text-text-muted">Delivery Rate</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-accent-purple">{openRate}%</p>
          <p className="text-xs text-text-muted">Open Rate</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-accent-gold">{clickRate}%</p>
          <p className="text-xs text-text-muted">Click Rate</p>
        </div>
      </div>
    </div>
  )
}
