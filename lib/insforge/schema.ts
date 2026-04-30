export interface User {
  id: string
  email: string
  password_hash: string
  full_name: string
  role: 'admin' | 'operator'
  avatar_url?: string
  is_active: boolean
  last_login?: string
  created_at: string
}

export interface BusinessProfile {
  id: string
  name: string
  tagline: string
  description: string
  divisions: Division[]
  contact_info: ContactInfo
  brand_voice: string
  logo_url?: string
  brand_colors: string[]
  updated_at: string
}

export interface Division {
  name: string
  products: string[]
  target_customers: string[]
  pain_points: string[]
  usps: string[]
}

export interface ContactInfo {
  address: string
  phone: string[]
  email: string
  website: string
}

export interface Product {
  id: string
  division: 'marine' | 'tech'
  category: string
  brand: string
  name: string
  model?: string
  description: string
  features: string[]
  specifications: Record<string, string>
  price_naira?: number
  price_display: string
  images: ProductImage[]
  keywords: string[]
  is_new_arrival: boolean
  is_featured: boolean
  is_available: boolean
  availability_note?: string
  warranty?: string
  installation_required: boolean
  installation_area: string[]
  created_at: string
  updated_at: string
}

export interface ProductImage {
  url: string
  alt: string
  is_primary: boolean
}

export interface Trend {
  id: string
  keyword: string
  topic: string
  description: string
  source: string
  source_url: string
  momentum_score: number
  division_relevance: 'marine' | 'tech' | 'both'
  matched_products: string[]
  is_breaking: boolean
  discovered_at: string
  expires_at: string
  status: string
}

export interface Competitor {
  id: string
  name: string
  website?: string
  facebook_url?: string
  instagram_url?: string
  division: 'marine' | 'tech' | 'both'
  last_scanned?: string
  intel_report?: any
  active_ads: any[]
  posting_patterns?: any
  created_at: string
}

export interface SocialPost {
  id: string
  division: 'marine' | 'tech'
  product_id?: string
  trend_id?: string
  post_type: string
  platform: string
  caption: string
  hashtags: string[]
  image_url?: string
  image_source?: string
  cta: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduled_at?: string
  published_at?: string
  platform_post_id?: string
  engagement?: any
  auto_generated: boolean
  created_at: string
}

export interface UGCAd {
  id: string
  division: 'marine' | 'tech'
  product_id?: string
  ad_type: string
  platform: string
  headline: string
  primary_text: string
  description?: string
  cta_button: string
  video_script?: string
  image_url?: string
  status: 'draft' | 'approved' | 'used'
  used_in_campaign: boolean
  campaign_id?: string
  created_at: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  company?: string
  location: string
  division_interest: 'marine' | 'tech' | 'both'
  product_interest: string[]
  source: 'scraping' | 'whatsapp_inquiry' | 'referral' | 'walk_in' | 'social_dm' | 'google'
  status: 'new' | 'contacted' | 'interested' | 'quote_sent' | 'customer' | 'lost'
  score: number
  tier: 'hot' | 'warm' | 'cold'
  notes?: string
  last_contact?: string
  next_action?: string
  next_action_date?: string
  created_at: string
}

export interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'whatsapp'
  division: 'marine' | 'tech' | 'both'
  target_leads: string[]
  message_template: string
  subject?: string
  media_url?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  scheduled_at?: string
  sent_at?: string
  stats?: any
  created_at: string
}

export interface SocialAccount {
  id: string
  platform: string
  account_name: string
  account_id: string
  access_token: string
  token_expiry?: string
  is_connected: boolean
  last_post?: string
  post_count_today: number
  created_at: string
}

export interface ApiKey {
  id: string
  service: string
  key_name: string
  encrypted_value: string
  is_active: boolean
  last_tested?: string
  last_test_result?: string
  usage_today: number
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  details: any
  ip_address: string
  user_agent: string
  created_at: string
}

export interface FeatureToggle {
  id: string
  feature_key: string
  is_enabled: boolean
  value: any
  updated_by: string
  updated_at: string
}

export interface AnalyticsDaily {
  id: string
  date: string
  posts_published: number
  total_reach: number
  total_engagement: number
  leads_generated: number
  campaigns_sent: number
  ai_cost_usd: number
  platform_breakdown: any
  top_posts: any[]
}
