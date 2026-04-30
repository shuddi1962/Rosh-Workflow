import Link from 'next/link'

export default async function AdminUsersPage() {
  const { insforgeAdmin } = await import('@/lib/insforge/client')
  const { data: users } = await insforgeAdmin
    .database
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">👥 User Management</h1>
        <Link href="/admin/users/new" className="px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg">+ Create User</Link>
      </div>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-elevated">
            <tr>
              <th className="text-left p-4 text-text-secondary text-sm">Name</th>
              <th className="text-left p-4 text-text-secondary text-sm">Email</th>
              <th className="text-left p-4 text-text-secondary text-sm">Role</th>
              <th className="text-left p-4 text-text-secondary text-sm">Status</th>
              <th className="text-left p-4 text-text-secondary text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user: any) => (
              <tr key={user.id} className="border-t border-border-subtle">
                <td className="p-4 text-text-primary">{user.full_name}</td>
                <td className="p-4 text-text-secondary">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-accent-purple/20 text-accent-purple' : 'bg-bg-elevated text-text-secondary'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-status-live/20 text-status-live' : 'bg-status-failed/20 text-status-failed'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-accent-red text-sm">Toggle Status</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <p className="p-8 text-text-muted text-center">No users yet. Create the first admin user.</p>
        )}
      </div>
    </div>
  )
}
