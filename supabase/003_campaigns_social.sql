-- Roshanal AI — Supabase Schema (Part 3: Campaigns & Social)

-- 12. CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'whatsapp')),
  division TEXT DEFAULT 'both' CHECK (division IN ('marine', 'tech', 'both')),
  target_leads TEXT[] DEFAULT '{}',
  message_template TEXT NOT NULL,
  subject TEXT,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. CAMPAIGN SEQUENCES
CREATE TABLE IF NOT EXISTS campaign_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  step_number NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp', 'sms', 'wait', 'condition', 'voice_call')),
  delay_days NUMERIC DEFAULT 0,
  delay_hours NUMERIC DEFAULT 0,
  send_at_time TEXT DEFAULT '09:00',
  template_id UUID,
  condition JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. CAMPAIGN EVENTS
CREATE TABLE IF NOT EXISTS campaign_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. SOCIAL ACCOUNTS
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ,
  is_connected BOOLEAN DEFAULT true,
  last_post TIMESTAMPTZ,
  post_count_today NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. EMAIL TEMPLATES
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  division TEXT DEFAULT 'both' CHECK (division IN ('marine', 'tech', 'both')),
  type TEXT NOT NULL,
  subject_options TEXT[] DEFAULT '{}',
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  usage_count NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. AUTOMATION TRIGGERS
CREATE TABLE IF NOT EXISTS automation_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  trigger_expression TEXT NOT NULL,
  actions_json JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  fired_count NUMERIC DEFAULT 0,
  last_fired TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
