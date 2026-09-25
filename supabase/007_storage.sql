-- Zorixza — Cloud Drive / Document Management (Part 7: Storage)
-- Run in Supabase SQL Editor AFTER 006. Idempotent.
-- Object bytes live in the private `cloud-drive` storage bucket; every table
-- below stores metadata only and is always scoped by business_id (tenant).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 44. STORAGE PLANS (admin-configurable catalog; prices are defaults only —
--    management changes them in Admin > Cloud Storage, never in code)
CREATE TABLE IF NOT EXISTS storage_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  rank NUMERIC NOT NULL DEFAULT 0,
  capacity_bytes BIGINT NOT NULL DEFAULT 5368709120,
  price_monthly_ngn NUMERIC NOT NULL DEFAULT 0,
  price_annual_ngn NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  max_file_bytes BIGINT NOT NULL DEFAULT 104857600,
  max_users INTEGER NOT NULL DEFAULT 3,
  retention_days INTEGER NOT NULL DEFAULT 30,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 45. STORAGE SUBSCRIPTIONS (business → storage plan; server-authoritative)
CREATE TABLE IF NOT EXISTS storage_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES storage_plans(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL DEFAULT 'Free',
  capacity_bytes BIGINT NOT NULL DEFAULT 5368709120,
  status TEXT NOT NULL DEFAULT 'active',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  provider TEXT NOT NULL DEFAULT 'manual',
  provider_reference TEXT DEFAULT '',
  renews_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 46. STORAGE USAGE (incremental quota accounting per workspace)
CREATE TABLE IF NOT EXISTS storage_usage (
  business_id UUID PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
  used_bytes BIGINT NOT NULL DEFAULT 0,
  file_count INTEGER NOT NULL DEFAULT 0,
  last_warning_level INTEGER NOT NULL DEFAULT 0,
  last_warning_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 47. CLOUD FOLDERS
CREATE TABLE IF NOT EXISTS cloud_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES cloud_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT '',
  is_starred BOOLEAN NOT NULL DEFAULT false,
  trashed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 48. CLOUD FILES (metadata; bytes in object storage under storage_key)
CREATE TABLE IF NOT EXISTS cloud_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES cloud_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  extension TEXT NOT NULL DEFAULT '',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  storage_provider TEXT NOT NULL DEFAULT 'supabase',
  storage_key TEXT NOT NULL DEFAULT '',
  checksum TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  created_by TEXT NOT NULL DEFAULT '',
  created_by_name TEXT NOT NULL DEFAULT '',
  is_starred BOOLEAN NOT NULL DEFAULT false,
  trashed_at TIMESTAMPTZ,
  trashed_by TEXT DEFAULT '',
  last_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 49. CLOUD FILE VERSIONS
CREATE TABLE IF NOT EXISTS cloud_file_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL REFERENCES cloud_files(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  storage_key TEXT NOT NULL DEFAULT '',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  checksum TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '',
  created_by_name TEXT NOT NULL DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 50. CLOUD FILE SHARES (internal sharing to workspace members)
CREATE TABLE IF NOT EXISTS cloud_file_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  file_id UUID REFERENCES cloud_files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES cloud_folders(id) ON DELETE CASCADE,
  shared_with_user_id TEXT NOT NULL DEFAULT '',
  shared_with_email TEXT NOT NULL DEFAULT '',
  permission TEXT NOT NULL DEFAULT 'viewer',
  created_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 51. CLOUD SHARE LINKS (secure expiring links, disabled by default)
CREATE TABLE IF NOT EXISTS cloud_share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  file_id UUID REFERENCES cloud_files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES cloud_folders(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  permission TEXT NOT NULL DEFAULT 'viewer',
  password_hash TEXT DEFAULT '',
  expires_at TIMESTAMPTZ,
  max_downloads INTEGER,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 52. CLOUD FILE ACTIVITY (auditable document history)
CREATE TABLE IF NOT EXISTS cloud_file_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  file_id UUID REFERENCES cloud_files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES cloud_folders(id) ON DELETE CASCADE,
  actor_user_id TEXT NOT NULL DEFAULT '',
  actor_name TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 53. CLOUD FILE LINKS (attach drive files to business records w/o duplication)
CREATE TABLE IF NOT EXISTS cloud_file_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES cloud_files(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(file_id, entity_type, entity_id)
);

-- 54. STORAGE TRANSACTIONS (payment history, server-verified only)
CREATE TABLE IF NOT EXISTS storage_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES storage_subscriptions(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL DEFAULT '',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  amount_ngn NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  provider TEXT NOT NULL DEFAULT 'manual',
  provider_reference TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Private object bucket for drive bytes (metadata stays in tables above)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cloud-drive', 'cloud-drive', false)
ON CONFLICT (id) DO NOTHING;

-- Seed storage plans (defaults only — edited in Admin > Cloud Storage)
INSERT INTO storage_plans (name, rank, capacity_bytes, price_monthly_ngn, price_annual_ngn, currency, max_file_bytes, max_users, retention_days, features)
VALUES
  ('Free', 0, 5368709120, 0, 0, 'NGN', 104857600, 3, 30, '["5 GB workspace storage","100 MB max file size","30-day trash retention","Up to 3 users"]'),
  ('Business', 1, 107374182400, 25000, 250000, 'NGN', 2147483648, 10, 90, '["100 GB workspace storage","2 GB max file size","90-day trash retention","Up to 10 users","Share links with expiry"]'),
  ('Business Plus', 2, 536870912000, 60000, 600000, 'NGN', 10737418240, 50, 180, '["500 GB workspace storage","10 GB max file size","180-day trash retention","Up to 50 users","Share links with password + expiry"]'),
  ('Enterprise', 3, 1099511627776, 0, 0, 'NGN', 54975581388, 1000000, 365, '["1 TB+ workspace storage","Configurable file size","365-day trash retention","Unlimited users","Dedicated support"]')
ON CONFLICT (name) DO NOTHING;

-- Drive platform defaults (retention, public links, provider)
INSERT INTO feature_toggles (feature_key, is_enabled, value, updated_by)
VALUES
  ('drive_public_links_enabled', false, '{"note":"Admin must explicitly allow public share links"}', 'seed'),
  ('drive_trash_retention_days', true, '{"days":30}', 'seed'),
  ('drive_payment_provider', true, '{"provider":"none","note":"none | paystack | flutterwave — secrets live in Admin > API Keys vault"}', 'seed')
ON CONFLICT (feature_key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_cloud_files_business ON cloud_files(business_id);
CREATE INDEX IF NOT EXISTS idx_cloud_files_folder ON cloud_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_cloud_files_trashed ON cloud_files(business_id, trashed_at);
CREATE INDEX IF NOT EXISTS idx_cloud_folders_business ON cloud_folders(business_id);
CREATE INDEX IF NOT EXISTS idx_cloud_folders_parent ON cloud_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_cloud_versions_file ON cloud_file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_cloud_shares_file ON cloud_file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_cloud_shares_user ON cloud_file_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_activity_file ON cloud_file_activity(file_id);
CREATE INDEX IF NOT EXISTS idx_cloud_links_entity ON cloud_file_links(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_storage_subs_business ON storage_subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_storage_tx_business ON storage_transactions(business_id);

ALTER TABLE storage_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_file_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_file_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access storage_plans" ON storage_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access storage_subscriptions" ON storage_subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access storage_usage" ON storage_usage FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cloud_folders" ON cloud_folders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cloud_files" ON cloud_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cloud_file_versions" ON cloud_file_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cloud_file_shares" ON cloud_file_shares FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cloud_share_links" ON cloud_share_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cloud_file_activity" ON cloud_file_activity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cloud_file_links" ON cloud_file_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access storage_transactions" ON storage_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can view storage plans" ON storage_plans FOR SELECT USING (true);
