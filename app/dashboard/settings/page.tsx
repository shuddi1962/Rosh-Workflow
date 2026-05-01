export default function DashboardSettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-clash font-bold text-gray-900 mb-8">Settings</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
              <input type="text" className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Email</label>
              <input type="email" className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900" />
            </div>
          </div>
        </div>
        
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  )
}
