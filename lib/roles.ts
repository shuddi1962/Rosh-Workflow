// GrowPilot — departments, staff roles & module permissions.
// A business owner assigns each staff member a department + staff role.
// The staff role decides which modules the staff member may open; the
// subscription plan decides which modules the business itself may use.
// Effective access = role allows it AND plan allows it.

export const DEPARTMENTS = [
  'administration',
  'marine_operations',
  'tech_operations',
  'sales',
  'marketing',
  'accounts',
  'customer_service',
  'ict',
] as const

export type Department = (typeof DEPARTMENTS)[number]

export const DEPARTMENT_LABELS: Record<Department, string> = {
  administration: 'Administration',
  marine_operations: 'Marine Operations',
  tech_operations: 'Tech / Surveillance Operations',
  sales: 'Sales',
  marketing: 'Marketing',
  accounts: 'Accounts / Finance',
  customer_service: 'Customer Service',
  ict: 'ICT',
}

export const MODULES = [
  'overview',
  'content',
  'trends',
  'competitors',
  'crm',
  'social',
  'campaigns',
  'products',
  'inventory',
  'documents',
  'drive',
  'work',
  'ugc',
  'creative',
  'voice',
  'whatsapp',
  'analytics',
  'settings',
] as const

export type ModuleKey = (typeof MODULES)[number]

export const MODULE_LABELS: Record<ModuleKey, string> = {
  overview: 'Overview',
  content: 'Content Brain',
  trends: 'Trends',
  competitors: 'Competitors',
  crm: 'CRM Pipeline',
  social: 'Social Media',
  campaigns: 'Campaigns',
  products: 'Products',
  inventory: 'Inventory',
  documents: 'Receipt Custody',
  drive: 'Cloud Drive',
  work: 'Schedule & Reports',
  ugc: 'UGC Creator',
  creative: 'Creative Studio',
  voice: 'Voice Agents',
  whatsapp: 'WhatsApp Inbox',
  analytics: 'Analytics',
  settings: 'Settings',
}

export type StaffRole =
  | 'owner'
  | 'manager'
  | 'inventory_officer'
  | 'accounts_officer'
  | 'sales_rep'
  | 'marketer'
  | 'support_rep'
  | 'viewer'

export const STAFF_ROLES: Array<{
  value: StaffRole
  label: string
  description: string
  modules: ModuleKey[]
}> = [
  { value: 'owner', label: 'Owner', description: 'Full access to everything in the business workspace.', modules: [...MODULES] },
  { value: 'manager', label: 'Line Manager', description: 'Team schedules, reviews, inventory, documents and reports.', modules: ['overview', 'products', 'inventory', 'documents', 'drive', 'work', 'crm', 'analytics', 'settings'] },
  { value: 'inventory_officer', label: 'Inventory Officer', description: 'Stock, warehouses, goods receiving and transfers.', modules: ['overview', 'products', 'inventory', 'documents', 'drive', 'work'] },
  { value: 'accounts_officer', label: 'Accounts Officer', description: 'Receipt verification, documents and reports.', modules: ['overview', 'documents', 'drive', 'work', 'analytics', 'inventory'] },
  { value: 'sales_rep', label: 'Sales Rep', description: 'CRM, campaigns, products and customer messaging.', modules: ['overview', 'crm', 'campaigns', 'products', 'drive', 'whatsapp', 'work'] },
  { value: 'marketer', label: 'Marketer', description: 'Content, social, trends, competitors and creative studio.', modules: ['overview', 'content', 'trends', 'competitors', 'social', 'ugc', 'creative', 'drive', 'campaigns', 'analytics'] },
  { value: 'support_rep', label: 'Support Rep', description: 'Inbox, reviews and customer follow-up.', modules: ['overview', 'whatsapp', 'crm', 'drive', 'work'] },
  { value: 'viewer', label: 'Viewer', description: 'Read-only overview and reports.', modules: ['overview', 'analytics'] },
]

export function roleAllows(role: string | undefined | null, moduleKey: string): boolean {
  if (!role) return true // legacy users without a staff role keep existing access
  if (role === 'admin') return true
  const def = STAFF_ROLES.find((r) => r.value === role)
  if (!def) return true
  return (def.modules as string[]).includes(moduleKey)
}

export function staffRoleLabel(role: string | undefined | null): string {
  const def = STAFF_ROLES.find((r) => r.value === role)
  return def ? def.label : (role || 'Staff')
}
