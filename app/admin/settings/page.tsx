'use client'

import { useState } from 'react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'Roshanal Infotech Limited',
    tagline: 'Your Trusted Partner for Marine & Technology Solutions',
    address: 'No 18A Rumuola/Rumuadaolu Road, Port Harcourt',
    phone: '08109522432 | 08033170802',
    email: 'info@roshanalinfotech.com',
  })

  function handleChange(field: string, value: string) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch {
      alert('Error saving settings')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-clash font-bold text-text-primary mb-8">Business Settings</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-border-subtle shadow-sm p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Company Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-text-secondary mb-2 font-medium">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full p-3 bg-white border border-border-default rounded-lg text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-2 font-medium">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full p-3 bg-white border border-border-default rounded-lg text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-2 font-medium">Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full p-3 bg-white border border-border-default rounded-lg text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary mb-2 font-medium">Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full p-3 bg-white border border-border-default rounded-lg text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="block text-text-secondary mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full p-3 bg-white border border-border-default rounded-lg text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                />
              </div>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          className="px-6 py-3 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-primary/90"
        >
          Save Settings
        </button>
      </form>
    </div>
  )
}
