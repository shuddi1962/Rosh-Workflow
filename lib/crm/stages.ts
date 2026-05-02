export const ROSHANAL_CRM_STAGES = [
  {
    id: 'new_lead',
    label: 'New Lead',
    color: '#3B82F6',
    icon: 'UserPlus',
    auto_action: 'Run AI qualification within 5 minutes',
  },
  {
    id: 'qualified',
    label: 'Qualified',
    color: '#8B5CF6',
    icon: 'CheckCircle',
    auto_action: 'Send welcome email sequence immediately',
  },
  {
    id: 'contacted',
    label: 'Contacted',
    color: '#F59E0B',
    icon: 'PhoneCall',
    auto_action: 'Schedule follow-up in 48h if no reply',
  },
  {
    id: 'interested',
    label: 'Interested',
    color: '#10B981',
    icon: 'ThumbsUp',
    auto_action: 'Send product catalog + schedule demo call',
  },
  {
    id: 'quote_sent',
    label: 'Quote Sent',
    color: '#06B6D4',
    icon: 'FileText',
    auto_action: 'Follow up in 72h if no response',
  },
  {
    id: 'negotiation',
    label: 'Negotiation',
    color: '#F97316',
    icon: 'ArrowLeftRight',
    auto_action: 'Notify team member. No auto-action.',
  },
  {
    id: 'customer',
    label: 'Customer',
    color: '#10B981',
    icon: 'Star',
    auto_action: 'Send thank-you email + request review',
  },
  {
    id: 'lost',
    label: 'Lost',
    color: '#EF4444',
    icon: 'XCircle',
    auto_action: 'Add to re-engagement sequence after 30 days',
  },
]

export const STAGE_ORDER = [
  'new_lead', 'qualified', 'contacted', 'interested',
  'quote_sent', 'negotiation', 'customer', 'lost',
]

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
