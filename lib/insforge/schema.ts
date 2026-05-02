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
  first_name: string
  last_name: string
  full_name: string
  email?: string
  phone: string
  whatsapp?: string
  company?: string
  job_title?: string
  website?: string
  linkedin_url?: string
  instagram_handle?: string
  country: string
  state: string
  city: string
  address?: string
  area?: string
  division_interest: 'marine' | 'tech' | 'both'
  product_interests: string[]
  customer_type: 'individual' | 'business' | 'government' | 'ngo'
  company_size?: 'micro' | 'sme' | 'mid' | 'enterprise'
  industry?: string
  stage: CRMStage
  score: number
  tier: 'hot' | 'warm' | 'cold' | 'disqualified'
  icp_match: number
  budget_signal: 'high' | 'medium' | 'low' | 'unknown'
  urgency: 'immediate' | 'this_month' | 'this_quarter' | 'future' | 'unknown'
  decision_maker: boolean
  qualification_status: 'pending' | 'qualified' | 'disqualified' | 'manual_override'
  qualification_grade: 'A' | 'B' | 'C' | 'D'
  qualification_reasons: string[]
  disqualifiers: string[]
  qualification_notes: string
  recommended_approach: string
  talking_points: string[]
  best_channel: 'whatsapp' | 'email' | 'call' | 'sms'
  qualified_at?: string
  source: LeadSource
  source_detail?: string
  utm_source?: string
  utm_campaign?: string
  tags: string[]
  notes: string
  emails_sent: number
  emails_opened: number
  emails_clicked: number
  whatsapp_sent: number
  sms_sent: number
  calls_made: number
  calls_answered: number
  last_contacted?: string
  last_response?: string
  next_action: string
  next_action_date?: string
  next_action_type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'demo'
  assigned_to?: string
  estimated_deal_value_ngn?: number
  products_quoted: string[]
  email_consent: boolean
  sms_consent: boolean
  whatsapp_consent: boolean
  call_consent: boolean
  opted_out: boolean
  created_at: string
  updated_at: string
}

export type CRMStage =
  | 'new_lead'
  | 'qualified'
  | 'contacted'
  | 'interested'
  | 'quote_sent'
  | 'negotiation'
  | 'customer'
  | 'lost'

export type LeadSource =
  | 'google_maps_scrape'
  | 'linkedin_scrape'
  | 'instagram_scrape'
  | 'facebook_scrape'
  | 'google_search_scrape'
  | 'website_scrape'
  | 'whatsapp_inbound'
  | 'instagram_dm'
  | 'facebook_message'
  | 'referral'
  | 'walk_in'
  | 'call_inbound'
  | 'csv_import'
  | 'manual'
  | 'web_form'
  | 'google_ads'
  | 'facebook_ads'

export interface CRMActivity {
  id: string
  lead_id: string
  type: 'email_sent' | 'email_opened' | 'email_clicked' | 'email_replied' |
        'whatsapp_sent' | 'whatsapp_read' | 'whatsapp_replied' |
        'call_outbound' | 'call_inbound' | 'call_missed' | 'call_answered' |
        'sms_sent' | 'sms_replied' |
        'stage_changed' | 'score_updated' | 'note_added' |
        'quote_sent' | 'meeting_booked' | 'purchase'
  description: string
  metadata: Record<string, unknown>
  performed_by: 'system' | 'ai_agent' | string
  created_at: string
}

export interface CallLog {
  id: string
  lead_id?: string
  agent_id: string
  call_sid: string
  conversation_id: string
  type: 'inbound' | 'outbound'
  from_number: string
  to_number: string
  duration_seconds: number
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'no_answer' | 'busy' | 'failed'
  outcome: 'interested' | 'not_interested' | 'callback' | 'voicemail' | 'no_answer' | 'wrong_number' | 'complaint' | 'sale'
  transcript: Array<{ role: string; content: string; timestamp: string }>
  ai_summary: string
  key_points: string[]
  next_action: string
  audio_url?: string
  started_at: string
  ended_at: string
  created_at: string
}

export interface VoiceAgent {
  id: string
  name: string
  type: 'inbound' | 'outbound'
  division: 'marine' | 'tech' | 'both'
  elevenlabs_agent_id?: string
  voice_id: string
  system_prompt: string
  first_message: string
  is_active: boolean
  total_calls: number
  avg_duration: number
  success_rate: number
  created_at: string
}

export interface CampaignSequence {
  id: string
  campaign_id: string
  step_number: number
  type: 'email' | 'whatsapp' | 'sms' | 'wait' | 'condition' | 'voice_call'
  delay_days: number
  delay_hours: number
  send_at_time: string
  template_id?: string
  condition?: {
    if: 'opened' | 'clicked' | 'replied' | 'not_opened' | 'not_replied'
    then: 'next_step' | 'skip_to' | 'remove_from_sequence' | 'notify_team'
    target_step?: number
  }
  status: 'draft' | 'active' | 'completed' | 'skipped'
  created_at: string
}

export interface CampaignV2 {
  id: string
  name: string
  type: 'email' | 'whatsapp' | 'sms' | 'voice' | 'multi_channel'
  division: 'marine' | 'tech' | 'both'
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed'
  audience: {
    lead_grade: ('A' | 'B' | 'C')[]
    lead_tier: ('hot' | 'warm' | 'cold')[]
    division_interest: string[]
    product_interests: string[]
    location_filter: string[]
    crm_stage: string[]
    tags: string[]
  }
  total_recipients: number
  preflight: {
    qualification_check: boolean
    consent_check: boolean
    unsubscribe_check: boolean
    budget_check: boolean
    ready_to_send: boolean
    blockers: string[]
  }
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    replied: number
    converted: number
    unsubscribed: number
    bounced: number
    open_rate: number
    click_rate: number
    reply_rate: number
    conversion_rate: number
  }
  created_at: string
  scheduled_at?: string
  completed_at?: string
}

export interface AutomationTrigger {
  id: string
  name: string
  trigger_expression: string
  actions_json: Record<string, unknown>[]
  is_active: boolean
  fired_count: number
  last_fired?: string
  created_at: string
}

export interface EmailTemplate {
  id: string
  name: string
  division: 'marine' | 'tech' | 'both'
  type: string
  subject_options: string[]
  content: string
  variables: string[]
  is_active: boolean
  usage_count: number
  created_at: string
}

export interface GeneratedBanner {
  id: string
  division: 'marine' | 'tech'
  product_id?: string
  banner_type: string
  style: string
  prompt: string
  model: string
  image_url: string
  size: string
  format: string
  cost_usd: number
  is_saved: boolean
  created_at: string
}

export interface Review {
  id: string
  lead_id?: string
  product_id?: string
  platform: 'google' | 'facebook' | 'whatsapp' | 'video'
  rating: number
  review_text: string
  video_url?: string
  requested_at?: string
  submitted_at?: string
  published_to_social: boolean
  social_post_id?: string
  created_at: string
}

export interface Referral {
  id: string
  referrer_lead_id: string
  referred_lead_id: string
  referral_code: string
  status: 'pending' | 'qualified' | 'customer' | 'paid'
  reward_ngn: number
  paid_at?: string
  created_at: string
}

export interface ProductSource {
  id: string
  product_id: string
  source_type: 'manual' | 'url_scrape' | 'image_upload' | 'csv_import' | 'manufacturer_search'
  source_url?: string
  raw_extracted_data: Record<string, unknown>
  processed_at: string
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
