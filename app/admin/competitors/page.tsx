'use client'

import { useState, useEffect } from 'react'

interface Competitor {
  id: string
  name: string
  website: string | null
  facebook_url: string | null
  instagram_url: string | null
  division: 'marine' | 'tech' | 'both'
  last_scanned: string | null
  created_at: string
}

export default function AdminCompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [scraping, setScraping] = useState<string | null>(null)
  const [newComp, setNewComp] = useState({ name: '', division: 'marine' as 'marine' | 'tech' | 'both', website: '', facebook_url: '', instagram_url: '' })

  useEffect(() => {
    fetchCompetitors()
  }, [])

  const fetchCompetitors = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/competitors', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCompetitors(data.competitors || [])
    } catch (error) {
      console.error('Error fetching competitors:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCompetitor = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newComp),
      })
      if (res.ok) {
        setShowForm(false)
        setNewComp({ name: '', division: 'marine', website: '', facebook_url: '', instagram_url: '' })
        fetchCompetitors()
      }
    } catch (error) {
      console.error('Error adding competitor:', error)
    }
  }

  const scrapeCompetitor = async (id: string, name: string) => {
    setScraping(id)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/competitors/${id}/scrape`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchCompetitors()
      }
    } catch (error) {
      console.error('Error scraping:', error)
    } finally {
      setScraping(null)
    }
  }

  const deleteCompetitor = async (id: string) => {
    if (!confirm('Delete this competitor?')) return
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/competitors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setCompetitors(competitors.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('Error deleting competitor:', error)
    }
  }

  if (loading) return <div className="p-6 text-text-secondary">Loading competitors...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-clash font-bold text-text-primary">Competitor Intelligence</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-700 transition">+ Add Competitor</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Add Competitor</h2>
            <div className="space-y-4">
              <input type="text" value={newComp.name} onChange={(e) => setNewComp({...newComp, name: e.target.value})} placeholder="Competitor name" className="w-full p-3 border border-border-subtle rounded-lg text-text-primary" />
              <select value={newComp.division} onChange={(e) => setNewComp({...newComp, division: e.target.value as 'marine' | 'tech' | 'both'})} className="w-full p-3 border border-border-subtle rounded-lg text-text-primary">
                <option value="marine">Marine</option>
                <option value="tech">Technology</option>
                <option value="both">Both</option>
              </select>
              <input type="url" value={newComp.website} onChange={(e) => setNewComp({...newComp, website: e.target.value})} placeholder="Website URL" className="w-full p-3 border border-border-subtle rounded-lg text-text-primary" />
              <input type="url" value={newComp.facebook_url} onChange={(e) => setNewComp({...newComp, facebook_url: e.target.value})} placeholder="Facebook page URL" className="w-full p-3 border border-border-subtle rounded-lg text-text-primary" />
              <input type="url" value={newComp.instagram_url} onChange={(e) => setNewComp({...newComp, instagram_url: e.target.value})} placeholder="Instagram profile URL" className="w-full p-3 border border-border-subtle rounded-lg text-text-primary" />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border-subtle rounded-lg text-text-secondary hover:bg-bg-surface">Cancel</button>
                <button onClick={addCompetitor} className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-700">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitors.map((comp) => (
          <div key={comp.id} className="bg-white rounded-lg border border-border-subtle p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-text-primary">{comp.name}</h3>
                <p className="text-text-muted text-sm">{comp.website || 'No website'}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${comp.division === 'marine' ? 'bg-accent-primary/10 text-accent-primary' : comp.division === 'tech' ? 'bg-accent-purple/10 text-accent-purple' : 'bg-accent-gold/10 text-accent-gold'}`}>
                {comp.division}
              </span>
            </div>
            <div className="text-text-muted text-xs mb-4">Last scanned: {comp.last_scanned ? new Date(comp.last_scanned).toLocaleDateString() : 'Never'}</div>
            <div className="flex gap-2">
              <button
                onClick={() => scrapeCompetitor(comp.id, comp.name)}
                disabled={scraping === comp.id}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {scraping === comp.id ? 'Scraping...' : 'Scrape'}
              </button>
              <button
                onClick={() => deleteCompetitor(comp.id)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {competitors.length === 0 && (
        <div className="bg-white rounded-lg border border-border-subtle p-12 text-center">
          <p className="text-text-muted text-lg mb-2">No competitors added yet</p>
          <p className="text-text-muted text-sm">Add competitors to monitor their strategies and find gaps to exploit.</p>
        </div>
      )}
    </div>
  )
}
