import AnalyticsChart from '@/components/dashboard/analytics-chart'

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-8">📊 Full Platform Analytics</h1>
      <AnalyticsChart />
      
      <div className="mt-6 bg-bg-surface rounded-lg border border-border-subtle p-6">
        <h3 className="font-clash font-semibold text-text-primary mb-4">AI Costs Breakdown</h3>
        <p className="text-text-muted text-sm">Track API usage and costs across all AI services.</p>
      </div>
    </div>
  )
}
