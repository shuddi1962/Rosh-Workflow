import Link from 'next/link'
import { DBClient } from '@/lib/insforge/server'

const db = new DBClient()

export default async function AdminUsersPage() {
  const { data: users } = await db
    .from('users')
    .select('*')
  
  const usersList = (users as Array<Record<string, unknown>>) || []
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-gray-900">User Management</h1>
        <Link href="/admin/users/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg">+ Create User</Link>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-gray-600 text-sm">Name</th>
              <th className="text-left p-4 text-gray-600 text-sm">Email</th>
              <th className="text-left p-4 text-gray-600 text-sm">Role</th>
              <th className="text-left p-4 text-gray-600 text-sm">Status</th>
              <th className="text-left p-4 text-gray-600 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((user) => (
              <tr key={user.id as string} className="border-t border-gray-200">
                <td className="p-4 text-gray-900">{user.full_name as string}</td>
                <td className="p-4 text-gray-600">{user.email as string}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'}`}>
                    {user.role as string}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-red-600 text-sm">Toggle Status</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {usersList.length === 0 && (
          <p className="p-8 text-gray-500 text-center">No users yet. Create the first admin user.</p>
        )}
      </div>
    </div>
  )
}
