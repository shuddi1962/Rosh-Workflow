'use client'

import { useRouter } from 'next/navigation'

export default function CRMLeadsPage() {
  const router = useRouter()
  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-gray-900 mb-6">All Leads</h1>
      <p className="text-gray-600 mb-6">View and manage all leads in your CRM.</p>
      <button onClick={() => router.push('/dashboard/crm')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
        Go to Pipeline View
      </button>
    </div>
  )
}
