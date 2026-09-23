-- GrowPilot — Multi-tenant foundation (Part 6: Businesses, Staff Roles, Plans)
-- Run in Supabase SQL Editor AFTER 005. Idempotent.
-- Businesses own a subscription plan; staff belong to a business with a
-- department + staff role. Row-level tenant isolation of operational data
-- is enforced in API code by business scoping; backfilling tenant_id onto
-- legacy rows is a follow-up once every business is registered here.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 40. BUSINESSES (tenants)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'Starter',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 41. BUSINESS MEMBERS (staff assignment: department + staff role)
CREATE TABLE IF NOT EXISTS business_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_email TEXT DEFAULT '',
  user_name TEXT DEFAULT '',
  department TEXT NOT NULL DEFAULT 'administration',
  staff_role TEXT NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  invited_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- 42. PLANS (canonical catalog mirrored in lib/plans.ts)
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  price_display TEXT NOT NULL DEFAULT '',
  rank NUMERIC NOT NULL DEFAULT 0,
  team_members TEXT DEFAULT '',
  leads_per_month TEXT DEFAULT '',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 43. SUBSCRIPTIONS (business → plan)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'Starter',
  status TEXT NOT NULL DEFAULT 'trial',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  renews_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staff identity columns on users (nullable → legacy rows keep working)
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'administration';
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_role TEXT DEFAULT 'viewer';
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE SET NULL;

-- Seed plans
INSERT INTO plans (name, price_display, rank, team_members, leads_per_month, features)
VALUES
  ('Starter', '₦29,000/month', 0, 'Up to 3 team members', '1,000 leads/month', '["Dashboard & analytics","Product catalog","Inventory & warehouse","Receipt custody register","Daily & monthly reports","Content Brain (AI posts)"]'),
  ('Professional', '₦99,000/month', 1, 'Up to 10 team members', '10,000 leads/month', '["Everything in Starter","Social media scheduling","Trend monitor","Competitor intelligence","CRM pipeline & lead scoring","Campaigns","Work schedules & team review"]'),
  ('Business', '₦189,000/month', 2, 'Up to 50 team members', '50,000 leads/month', '["Everything in Professional","UGC ad creator","Image & banner studio","Video studio","Voice agents & call logs","Automation triggers","URL creative scraper"]'),
  ('Enterprise', 'Custom', 3, 'Unlimited team members', 'Unlimited leads', '["Everything in Business","WhatsApp inbox & auto-reply","Reviews, referrals & print center","Dedicated account manager","Custom integrations & SLA"]')
ON CONFLICT (name) DO NOTHING;

-- Seed default business for the existing single-company install
INSERT INTO businesses (name, slug, industry, email, plan, status)
VALUES ('Roshanal Infotech Limited', 'roshanal', 'Marine & Technology', 'info@roshanalinfotech.com', 'Enterprise', 'active')
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_members_business ON business_members(business_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_business ON subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_users_business ON users(business_id);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access businesses" ON businesses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access business_members" ON business_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access plans" ON plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can view plans" ON plans FOR SELECT USING (true);
