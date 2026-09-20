'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'

const PORT_HARCOURT_AREAS = [
  'GRA Phase 1', 'GRA Phase 2', 'GRA Phase 3', 'Rumuola', 'Rumuadaolu',
  'Eliozu', 'Trans Amadi', 'D-Line', 'Woji', 'Peter Odili Road',
  'Rumuokoro', 'Choba', 'Rumuibekwe', 'Ozuoba', 'Borokiri',
  'Mile 1', 'Mile 2', 'Mile 3', 'Diobu', 'Nkpor',
]

const OTHER_STATE_AREAS = [
  { name: 'Yenegoa, Bayelsa' },
  { name: 'Warri, Delta' },
  { name: 'Asaba, Delta' },
  { name: 'Calabar, Cross River' },
  { name: 'Owerri, Imo' },
  { name: 'Uyo, Akwa Ibom' },
]

interface AreaSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function AreaSelector({ value, onChange, className }: AreaSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPH = useMemo(() =>
    PORT_HARCOURT_AREAS.filter(area =>
      area.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm])

  const filteredOther = useMemo(() =>
    OTHER_STATE_AREAS.filter(area =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm])

  return (
    <div className={`rounded-lg border border-border-subtle p-4 bg-white ${className || ''}`}>
      {value && (
        <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm font-medium">
          Selected: {value}
        </div>
      )}

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search areas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-border-subtle rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      <div className="max-h-48 overflow-y-auto mb-4">
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Port Harcourt</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {filteredPH.map(area => (
            <button
              key={area}
              type="button"
              onClick={() => onChange(area)}
              className={`px-3 py-1.5 border rounded-lg text-xs text-left transition-all ${
                value === area
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-border-subtle text-text-secondary hover:bg-bg-surface hover:border-border-hover'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border-subtle pt-3 mt-3">
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Other States</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {filteredOther.map(area => (
            <button
              key={area.name}
              type="button"
              onClick={() => onChange(area.name)}
              className={`px-3 py-1.5 border rounded-lg text-xs text-left transition-all ${
                value === area.name
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-border-subtle text-text-secondary hover:bg-bg-surface hover:border-border-hover'
              }`}
            >
              {area.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
