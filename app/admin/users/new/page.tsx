import { redirect } from 'next/navigation'
import { createUser } from '@/app/actions/users'

export default function NewUserPage() {
  async function handleCreate(formData: FormData) {
    'use server'
    await createUser(formData)
    redirect('/admin/users')
  }
  
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-6">Create New User</h1>
      <form action={handleCreate} className="space-y-6 bg-bg-surface p-6 rounded-lg border border-border-subtle">
        <div>
          <label className="block text-text-secondary mb-2">Full Name</label>
          <input name="full_name" required className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary" />
        </div>
        <div>
          <label className="block text-text-secondary mb-2">Email</label>
          <input type="email" name="email" required className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary" />
        </div>
        <div>
          <label className="block text-text-secondary mb-2">Password</label>
          <input type="password" name="password" required minLength={8} className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary" />
        </div>
        <div>
          <label className="block text-text-secondary mb-2">Role</label>
          <select name="role" className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary">
            <option value="operator">Operator (Content Creator)</option>
            <option value="admin">Admin (Full Access)</option>
          </select>
        </div>
        <button type="submit" className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent rounded-lg font-medium">
          Create User
        </button>
      </form>
    </div>
  )
}
