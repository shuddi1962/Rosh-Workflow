'use client'

import { useRouter } from 'next/navigation'

export default function CRMLeadsPage() {
  const router = useRouter()
  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-6">All Leads</h1>
      <p className="text-text-secondary mb-6">View and manage all leads in your CRM.</p>
      <button onClick={() => router.push('/dashboard/crm')} className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90">
        Go to Pipeline View
      </button>
    </div>
  )
}
