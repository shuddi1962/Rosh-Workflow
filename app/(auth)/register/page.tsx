import { redirect } from 'next/navigation'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-void">
      <div className="w-full max-w-md p-8 bg-bg-surface rounded-lg border border-border-subtle">
        <h1 className="text-2xl font-clash font-semibold text-text-primary mb-6">Invite-Only Registration</h1>
        <p className="text-text-secondary mb-4">Account creation is by admin invitation only.</p>
        <a href="/login" className="text-accent-primary hover:underline">Back to Login</a>
      </div>
    </div>
  )
}
