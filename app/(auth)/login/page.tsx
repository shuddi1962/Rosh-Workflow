import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'

export default async function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-void">
      <div className="w-full max-w-md p-8 bg-bg-surface rounded-lg border border-border-subtle">
        <h1 className="text-2xl font-clash font-semibold text-text-primary mb-6">Login to Roshanal AI</h1>
        <form action="/api/auth/login" method="POST" className="space-y-4">
          <div>
            <label className="block text-text-secondary mb-2">Email</label>
            <input type="email" name="email" required className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary focus:border-accent-primary outline-none" />
          </div>
          <div>
            <label className="block text-text-secondary mb-2">Password</label>
            <input type="password" name="password" required className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary focus:border-accent-primary outline-none" />
          </div>
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent rounded-lg font-medium">Login</button>
        </form>
        <p className="mt-4 text-text-muted text-sm text-center">Contact admin for account creation</p>
      </div>
    </div>
  )
}
