-- Roshanal AI — Supabase Schema (Part 4: System, Analytics & Extras)

-- 18. API KEYS
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service TEXT NOT NULL,
  key_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_tested TIMESTAMPTZ,
  last_test_result TEXT,
  usage_today NUMERIC DEFAULT 0,
  usage_all_time NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service, key_name)
);

-- 19. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. FEATURE TOGGLES
CREATE TABLE IF NOT EXISTS feature_toggles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_key TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  value JSONB DEFAULT '{}',
  updated_by TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. ANALYTICS DAILY
CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  posts_published NUMERIC DEFAULT 0,
  total_reach NUMERIC DEFAULT 0,
  total_engagement NUMERIC DEFAULT 0,
  leads_generated NUMERIC DEFAULT 0,
  campaigns_sent NUMERIC DEFAULT 0,
  ai_cost_usd NUMERIC DEFAULT 0,
  platform_breakdown JSONB DEFAULT '{}',
  top_posts JSONB DEFAULT '[]'
);

-- 22. GENERATED BANNERS
CREATE TABLE IF NOT EXISTS generated_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division TEXT CHECK (division IN ('marine', 'tech')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  banner_type TEXT NOT NULL,
  style TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  image_url TEXT NOT NULL,
  size TEXT NOT NULL,
  format TEXT NOT NULL,
  cost_usd NUMERIC DEFAULT 0,
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 23. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  platform TEXT CHECK (platform IN ('google', 'facebook', 'whatsapp', 'video')),
  rating NUMERIC NOT NULL DEFAULT 5,
  review_text TEXT NOT NULL,
  video_url TEXT,
  requested_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  published_to_social BOOLEAN DEFAULT false,
  social_post_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 24. REFERRALS
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  referred_lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'customer', 'paid')),
  reward_ngn NUMERIC DEFAULT 0,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 25. PRODUCT SOURCES
CREATE TABLE IF NOT EXISTS product_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('manual', 'url_scrape', 'image_upload', 'csv_import', 'manufacturer_search')),
  source_url TEXT,
  raw_extracted_data JSONB DEFAULT '{}',
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 26. SOCIAL AUTO REPLIES
CREATE TABLE IF NOT EXISTS social_auto_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  incoming_text TEXT NOT NULL,
  customer_name TEXT DEFAULT '',
  customer_handle TEXT,
  customer_phone TEXT,
  reply_text TEXT NOT NULL,
  matched_trigger_id UUID,
  used_ai BOOLEAN DEFAULT false,
  intent TEXT DEFAULT '',
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  priority TEXT DEFAULT 'low' CHECK (priority IN ('high', 'medium', 'low')),
  cost_usd NUMERIC DEFAULT 0,
  latency_ms NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 27. SOCIAL INTERACTIONS
CREATE TABLE IF NOT EXISTS social_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('message', 'comment', 'mention', 'review', 'dm', 'reaction')),
  external_id TEXT NOT NULL,
  customer_name TEXT DEFAULT '',
  customer_handle TEXT,
  customer_phone TEXT,
  content TEXT NOT NULL,
  sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  auto_replied BOOLEAN DEFAULT false,
  reply_id UUID,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 28. KEYWORD TRIGGERS
CREATE TABLE IF NOT EXISTS keyword_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keywords TEXT[] DEFAULT '{}',
  platform TEXT NOT NULL,
  reply_template JSONB DEFAULT '{}',
  action TEXT DEFAULT 'reply',
  tag_product TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  fire_count NUMERIC DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_division ON products(division);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_trends_keyword ON trends(keyword);
CREATE INDEX IF NOT EXISTS idx_trends_status ON trends(status);
CREATE INDEX IF NOT EXISTS idx_competitors_division ON competitors(division);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_tier ON leads(tier);
CREATE INDEX IF NOT EXISTS idx_leads_division ON leads(division_interest);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_crm_activities_lead ON crm_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_lead ON call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign ON campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily(date);
CREATE INDEX IF NOT EXISTS idx_ugc_ads_division ON ugc_ads(division);
CREATE INDEX IF NOT EXISTS idx_ugc_ads_status ON ugc_ads(status);
CREATE INDEX IF NOT EXISTS idx_social_auto_replies_platform ON social_auto_replies(platform);
CREATE INDEX IF NOT EXISTS idx_social_interactions_platform ON social_interactions(platform);
CREATE INDEX IF NOT EXISTS idx_keyword_triggers_platform ON keyword_triggers(platform);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_product_sources_product ON product_sources(product_id);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_auto_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_triggers ENABLE ROW LEVEL SECURITY;

-- Public read for products and business_profile
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can view business_profile" ON business_profile FOR SELECT USING (true);

-- Service role full access (admin operations use service role key)
CREATE POLICY "Service role full access users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access business_profile" ON business_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access trends" ON trends FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access competitors" ON competitors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access social_posts" ON social_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access ugc_ads" ON ugc_ads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access crm_activities" ON crm_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access call_logs" ON call_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access voice_agents" ON voice_agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access campaigns" ON campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access campaign_sequences" ON campaign_sequences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access campaign_events" ON campaign_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access social_accounts" ON social_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access email_templates" ON email_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access automation_triggers" ON automation_triggers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access api_keys" ON api_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access feature_toggles" ON feature_toggles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access analytics_daily" ON analytics_daily FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access generated_banners" ON generated_banners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access referrals" ON referrals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access product_sources" ON product_sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access social_auto_replies" ON social_auto_replies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access social_interactions" ON social_interactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access keyword_triggers" ON keyword_triggers FOR ALL USING (true) WITH CHECK (true);
