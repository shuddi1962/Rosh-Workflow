export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-gray-900 mb-8">Analytics Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Reach', value: '0', change: '+0%' },
          { label: 'Posts Published', value: '0', change: '+0%' },
          { label: 'Leads Generated', value: '0', change: '+0%' },
          { label: 'Campaigns Sent', value: '0', change: '+0%' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 font-mono">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-gray-600">Analytics data will appear here once you start publishing content and running campaigns.</p>
      </div>
    </div>
  )
}
