export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-8">🌐 Business Settings</h1>
      
      <div className="bg-bg-surface rounded-lg border border-border-subtle p-6 mb-6">
        <h3 className="font-clash font-semibold text-text-primary mb-4">Company Information</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-text-secondary mb-2">Company Name</label>
            <input defaultValue="Roshanal Infotech Limited" className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary" />
          </div>
          <div>
            <label className="block text-text-secondary mb-2">Tagline</label>
            <input defaultValue="Your Trusted Partner for Marine & Technology Solutions" className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary" />
          </div>
          <div>
            <label className="block text-text-secondary mb-2">Address</label>
            <input defaultValue="No 18A Rumuola/Rumuadaolu Road, Port Harcourt" className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-2">Phone</label>
              <input defaultValue="08109522432 | 08033170802" className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary" />
            </div>
            <div>
              <label className="block text-text-secondary mb-2">Email</label>
              <input defaultValue="info@roshanalinfotech.com" className="w-full p-3 bg-bg-base border border-border-default rounded-lg text-text-primary" />
            </div>
          </div>
          <button type="submit" className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-primary-glow text-text-on-accent rounded-lg font-medium">
            Save Settings
          </button>
        </form>
      </div>
    </div>
  )
}
