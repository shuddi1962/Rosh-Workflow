export const ROSHANAL_CRM_STAGES = [
  {
    id: 'new_leads',
    label: 'New Leads',
    color: '#2563EB',
    border_color: 'border-blue-600',
    icon: 'UserPlus',
    auto_action: 'Trigger AI qualification within 5 minutes',
  },
  {
    id: 'contacted',
    label: 'Contacted',
    color: '#D97706',
    border_color: 'border-amber-500',
    icon: 'PhoneCall',
    auto_action: 'Schedule 48h follow-up if no reply',
  },
  {
    id: 'qualified',
    label: 'Qualified',
    color: '#7C3AED',
    border_color: 'border-purple-600',
    icon: 'CheckCircle',
    auto_action: 'Send product catalog + book demo call',
  },
  {
    id: 'proposal_sent',
    label: 'Proposal Sent',
    color: '#EA580C',
    border_color: 'border-orange-500',
    icon: 'FileText',
    auto_action: 'Follow up in 72h if no response',
  },
  {
    id: 'closed_won',
    label: 'Closed Won',
    color: '#16A34A',
    border_color: 'border-green-600',
    icon: 'Star',
    auto_action: 'Send thank-you email + request review',
  },
]

export const STAGE_ORDER = ['new_leads', 'contacted', 'qualified', 'proposal_sent', 'closed_won']

export const TIER_COLORS: Record<string, string> = {
  hot: 'bg-red-500',
  warm: 'bg-amber-500',
  cold: 'bg-blue-500',
  disqualified: 'bg-gray-500',
}

export const TIER_EMOJIS: Record<string, string> = {
  hot: '🔥',
  warm: '🌤️',
  cold: '❄️',
  disqualified: '🚫',
}

export const GRADE_COLORS: Record<string, string> = {
  A: 'text-red-600',
  B: 'text-amber-600',
  C: 'text-blue-600',
  D: 'text-gray-500',
}

export const PORT_HARCOURT_AREAS = [
  { id: 'gra1', name: 'GRA Phase 1', state: 'Rivers', city: 'Port Harcourt', lat: 4.8156, lon: 7.0498 },
  { id: 'gra2', name: 'GRA Phase 2', state: 'Rivers', city: 'Port Harcourt', lat: 4.8180, lon: 7.0450 },
  { id: 'gra3', name: 'GRA Phase 3', state: 'Rivers', city: 'Port Harcourt', lat: 4.8250, lon: 7.0400 },
  { id: 'rumuola', name: 'Rumuola', state: 'Rivers', city: 'Port Harcourt', lat: 4.8400, lon: 7.0100 },
  { id: 'rumuadaolu', name: 'Rumuadaolu', state: 'Rivers', city: 'Port Harcourt', lat: 4.8500, lon: 7.0200 },
  { id: 'eliozu', name: 'Eliozu', state: 'Rivers', city: 'Port Harcourt', lat: 4.8300, lon: 7.0300 },
  { id: 'trans_amadi', name: 'Trans Amadi', state: 'Rivers', city: 'Port Harcourt', lat: 4.8050, lon: 7.0100 },
  { id: 'dline', name: 'D-Line', state: 'Rivers', city: 'Port Harcourt', lat: 4.7800, lon: 7.0100 },
  { id: 'woji', name: 'Woji', state: 'Rivers', city: 'Port Harcourt', lat: 4.7700, lon: 7.0400 },
  { id: 'por', name: 'Peter Odili Road', state: 'Rivers', city: 'Port Harcourt', lat: 4.8000, lon: 7.0500 },
  { id: 'rumuokoro', name: 'Rumuokoro', state: 'Rivers', city: 'Port Harcourt', lat: 4.8700, lon: 6.9900 },
  { id: 'choba', name: 'Choba', state: 'Rivers', city: 'Port Harcourt', lat: 4.8900, lon: 6.9500 },
  { id: 'rumuibekwe', name: 'Rumuibekwe', state: 'Rivers', city: 'Port Harcourt', lat: 4.8450, lon: 7.0000 },
  { id: 'ozuoba', name: 'Ozuoba', state: 'Rivers', city: 'Port Harcourt', lat: 4.8600, lon: 6.9800 },
  { id: 'borokiri', name: 'Borokiri', state: 'Rivers', city: 'Port Harcourt', lat: 4.7600, lon: 7.0000 },
  { id: 'mile1', name: 'Mile 1', state: 'Rivers', city: 'Port Harcourt', lat: 4.7900, lon: 7.0050 },
  { id: 'mile2', name: 'Mile 2', state: 'Rivers', city: 'Port Harcourt', lat: 4.7950, lon: 7.0000 },
  { id: 'mile3', name: 'Mile 3', state: 'Rivers', city: 'Port Harcourt', lat: 4.8000, lon: 6.9950 },
  { id: 'diobu', name: 'Diobu', state: 'Rivers', city: 'Port Harcourt', lat: 4.7850, lon: 7.0200 },
  { id: 'nkpor', name: 'Nkpor', state: 'Rivers', city: 'Port Harcourt', lat: 4.8200, lon: 7.0350 },
]

export const OTHER_STATE_AREAS = [
  { id: 'yenegoa', name: 'Yenegoa', state: 'Bayelsa', city: 'Yenegoa' },
  { id: 'amarat', name: 'Amarat', state: 'Bayelsa', city: 'Yenegoa' },
  { id: 'ovom', name: 'Ovom', state: 'Bayelsa', city: 'Yenegoa' },
  { id: 'warri', name: 'Warri', state: 'Delta', city: 'Warri' },
  { id: 'asaba', name: 'Asaba', state: 'Delta', city: 'Asaba' },
  { id: 'calabar', name: 'Calabar', state: 'Cross River', city: 'Calabar' },
  { id: 'owerri', name: 'Owerri', state: 'Imo', city: 'Owerri' },
  { id: 'uyo', name: 'Uyo', state: 'Akwa Ibom', city: 'Uyo' },
]
