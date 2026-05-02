'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'operator'
  is_active: boolean
  last_login: string | null
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setSaving(id)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/admin/users/${id}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u))
      }
    } catch (error) {
      console.error('Error toggling status:', error)
    } finally {
      setSaving(null)
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  if (loading) return <div className="p-6 text-gray-600">Loading users...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-gray-900">User Management</h1>
        <Link href="/admin/users/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">+ Create User</Link>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-gray-600 text-sm">Name</th>
              <th className="text-left p-4 text-gray-600 text-sm">Email</th>
              <th className="text-left p-4 text-gray-600 text-sm">Role</th>
              <th className="text-left p-4 text-gray-600 text-sm">Status</th>
              <th className="text-left p-4 text-gray-600 text-sm">Last Login</th>
              <th className="text-left p-4 text-gray-600 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="p-4 text-gray-900 font-medium">{user.full_name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </td>
                <td className="p-4 space-x-3">
                  <button
                    onClick={() => toggleStatus(user.id, user.is_active)}
                    disabled={saving === user.id}
                    className="text-blue-600 text-sm hover:text-blue-800 disabled:opacity-50"
                  >
                    {saving === user.id ? 'Updating...' : 'Toggle'}
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-8 text-gray-500 text-center">No users yet. Create the first admin user.</p>
        )}
      </div>
    </div>
  )
}
