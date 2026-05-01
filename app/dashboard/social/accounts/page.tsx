export default function SocialAccountsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-gray-900">Social Media Accounts</h1>
      </div>
      
      <div className="space-y-4">
        {[
          { platform: 'Facebook', icon: '📘' },
          { platform: 'Instagram', icon: '📷' },
          { platform: 'WhatsApp Business', icon: '💬' },
          { platform: 'LinkedIn', icon: '💼' },
          { platform: 'Twitter/X', icon: '🐦' },
        ].map((account) => (
          <div key={account.platform} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{account.icon}</span>
              <div>
                <h3 className="font-medium text-gray-900">{account.platform}</h3>
                <p className="text-sm text-gray-500">Not connected</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
