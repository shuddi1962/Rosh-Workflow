import Link from 'next/link'

export default async function AdminApiKeysPage() {
  const { insforgeAdmin } = await import('@/lib/insforge/client')
  const { data: keys } = await insforgeAdmin
    .database
    .from('api_keys')
    .select('id, service, key_name, is_active, last_tested, last_test_result, usage_today, updated_at')
    .order('service', { ascending: true })
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">API Key Management</h1>
        <Link href="/admin/api-keys/new" className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg">+ Add Key</Link>
      </div>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-elevated">
            <tr>
              <th className="text-left p-4 text-text-secondary text-sm">Service</th>
              <th className="text-left p-4 text-text-secondary text-sm">Key Name</th>
              <th className="text-left p-4 text-text-secondary text-sm">Status</th>
              <th className="text-left p-4 text-text-secondary text-sm">Last Test</th>
              <th className="text-left p-4 text-text-secondary text-sm">Usage Today</th>
              <th className="text-left p-4 text-text-secondary text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys?.map((key: any) => (
              <tr key={key.id} className="border-t border-border-subtle">
                <td className="p-4 text-text-primary">{key.service}</td>
                <td className="p-4 text-text-secondary">{key.key_name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${key.is_active ? 'bg-status-live/20 text-status-live' : 'bg-status-draft/20 text-status-draft'}`}>
                    {key.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-text-muted text-sm">{key.last_tested ? new Date(key.last_tested).toLocaleDateString() : 'Never'}</td>
                <td className="p-4 text-text-secondary">{key.usage_today}</td>
                <td className="p-4">
                  <button className="text-accent-primary mr-2">Test</button>
                  <button className="text-accent-red">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!keys || keys.length === 0) && (
          <p className="p-8 text-text-muted text-center">No API keys configured yet.</p>
        )}
      </div>
    </div>
  )
}
