'use client'

export default function VoiceCallsPage() {
  return (
    <div>
      <h1 className="font-clash text-3xl font-bold text-gray-900 mb-6">Call History</h1>
      <p className="text-gray-600 mb-6">All inbound and outbound calls.</p>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg mb-2">No calls yet</p>
        <p className="text-gray-400 text-sm">Call logs will appear here when voice agents make or receive calls.</p>
      </div>
    </div>
  )
}
