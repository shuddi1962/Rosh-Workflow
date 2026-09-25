-- Zorixza — one-shot setup for missing tables (005 to 015)
-- Your Supabase project already has 001-004 applied. Run THIS file once in Supabase Dashboard > SQL editor to create every missing table (operations, multitenant, storage, connected-bos, whatsapp, sales, accounting, HR, field, money, verticals).
-- All statements are idempotent (IF NOT EXISTS / ON CONFLICT DO NOTHING), safe to re-run.
-- After running: wait ~30s for PostgREST schema-cache reload, then Retry the workspace page.

-- Roshanal AI / Zorixza — Operations Module (Part 5: Inventory, Receipt Custody & Staff Reporting)
-- Run this in Supabase SQL Editor AFTER 001-004. Idempotent: uses IF NOT EXISTS + ADD COLUMN IF NOT EXISTS.
-- Covers: warehouses, per-location stock, movements, transfers, purchase orders, goods receipts,
-- receipt custody register + custody events, work schedules, daily/monthly reports, notifications.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extend products with operational inventory columns (non-destructive)
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_of_measure TEXT DEFAULT 'pcs';
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity_on_hand NUMERIC DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_level NUMERIC DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS minimum_stock_level NUMERIC DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price_naira NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS warehouse_location TEXT DEFAULT 'Main Warehouse';
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'in_stock';
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 29. WAREHOUSES / LOCATIONS
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'warehouse',
  address TEXT DEFAULT '',
  manager_user_id TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 30. WAREHOUSE STOCK (per-location balances; one row per product+warehouse)
CREATE TABLE IF NOT EXISTS warehouse_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, warehouse_id)
);

-- 31. INVENTORY MOVEMENTS (auditable, never silently modify stock)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT UNIQUE NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('received','issued','sold','transferred','returned','adjustment','damaged','lost','opening_balance')),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL,
  previous_quantity NUMERIC NOT NULL DEFAULT 0,
  new_quantity NUMERIC NOT NULL DEFAULT 0,
  source_destination TEXT DEFAULT '',
  person_responsible TEXT DEFAULT '',
  reason TEXT DEFAULT '',
  related_document_type TEXT DEFAULT '',
  related_document_id TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  attachment_url TEXT,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 32. PURCHASE ORDERS (lightweight, referenced by GRN)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  supplier TEXT NOT NULL,
  division TEXT DEFAULT 'both',
  status TEXT NOT NULL DEFAULT 'draft',
  order_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_date TIMESTAMPTZ,
  items JSONB DEFAULT '[]',
  total_amount_naira NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 33. GOODS RECEIPTS (GRN workflow: PO -> received -> inspected -> stock updated)
CREATE TABLE IF NOT EXISTS goods_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grn_number TEXT UNIQUE NOT NULL,
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  purchase_order_ref TEXT DEFAULT '',
  supplier TEXT NOT NULL,
  delivery_date TIMESTAMPTZ,
  received_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  received_by TEXT DEFAULT '',
  verification_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT DEFAULT '',
  attachments JSONB DEFAULT '[]',
  stock_posted BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goods_receipt_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  ordered_quantity NUMERIC NOT NULL DEFAULT 0,
  received_quantity NUMERIC NOT NULL DEFAULT 0,
  damaged_quantity NUMERIC NOT NULL DEFAULT 0,
  accepted_quantity NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT ''
);

-- 34. RECEIPT & DOCUMENT CUSTODY REGISTER (physical + digital distinguished)
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_code TEXT UNIQUE NOT NULL,
  receipt_number TEXT DEFAULT '',
  document_type TEXT NOT NULL DEFAULT 'receipt',
  transaction_date DATE,
  date_received DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_vendor TEXT DEFAULT '',
  customer_name TEXT DEFAULT '',
  department TEXT DEFAULT '',
  project TEXT DEFAULT '',
  location TEXT DEFAULT '',
  amount_naira NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  payment_method TEXT DEFAULT '',
  expense_category TEXT DEFAULT '',
  purchase_reference TEXT DEFAULT '',
  purchase_order_ref TEXT DEFAULT '',
  goods_receipt_ref TEXT DEFAULT '',
  received_by TEXT DEFAULT '',
  current_holder TEXT DEFAULT '',
  physical_original_available BOOLEAN NOT NULL DEFAULT true,
  digital_copy_available BOOLEAN NOT NULL DEFAULT false,
  physical_storage_location TEXT DEFAULT '',
  filing_reference TEXT DEFAULT '',
  holder_since TIMESTAMPTZ,
  submitted_to TEXT DEFAULT '',
  submission_date TIMESTAMPTZ,
  verified_by TEXT DEFAULT '',
  verification_date TIMESTAMPTZ,
  approved_by TEXT DEFAULT '',
  approval_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'received',
  attachment_url TEXT,
  supporting_docs JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 35. RECEIPT CUSTODY EVENTS (every transfer audited)
CREATE TABLE IF NOT EXISTS receipt_custody_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  from_holder TEXT DEFAULT '',
  to_holder TEXT DEFAULT '',
  performed_by TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 36. WORK SCHEDULES (line-manager assigned)
CREATE TABLE IF NOT EXISTS work_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assigned_to TEXT NOT NULL DEFAULT '',
  assigned_to_name TEXT DEFAULT '',
  assigned_by TEXT DEFAULT '',
  department TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'scheduled',
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  related_module TEXT DEFAULT 'other',
  related_project TEXT DEFAULT '',
  progress_notes TEXT DEFAULT '',
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 37. DAILY REPORTS (Draft -> Submitted -> Reviewed -> Approved / Returned)
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_date DATE NOT NULL,
  employee_id TEXT NOT NULL DEFAULT '',
  employee_name TEXT DEFAULT '',
  department TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  summary TEXT DEFAULT '',
  challenges TEXT DEFAULT '',
  actions_taken TEXT DEFAULT '',
  achievements TEXT DEFAULT '',
  next_day_plan TEXT DEFAULT '',
  attachments JSONB DEFAULT '[]',
  reviewed_by TEXT DEFAULT '',
  reviewed_at TIMESTAMPTZ,
  review_comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(report_date, employee_id)
);

CREATE TABLE IF NOT EXISTS daily_report_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  activity_time TEXT DEFAULT '',
  activity TEXT NOT NULL,
  module TEXT NOT NULL DEFAULT 'other',
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'completed',
  result TEXT DEFAULT '',
  remarks TEXT DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual',
  source_ref TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 38. MONTHLY REPORTS (auto-compiled from daily data, human approval)
CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year_month TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  executive_summary TEXT DEFAULT '',
  payload JSONB DEFAULT '{}',
  challenges TEXT DEFAULT '',
  actions_taken TEXT DEFAULT '',
  achievements TEXT DEFAULT '',
  recommendations TEXT DEFAULT '',
  next_month_plan TEXT DEFAULT '',
  prepared_by TEXT DEFAULT '',
  reviewed_by TEXT DEFAULT '',
  reviewed_at TIMESTAMPTZ,
  review_comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 39. OPERATIONS NOTIFICATIONS (reminders without spam)
CREATE TABLE IF NOT EXISTS operations_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_user_id TEXT NOT NULL DEFAULT '',
  recipient_role TEXT DEFAULT 'employee',
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  entity_type TEXT DEFAULT '',
  entity_id TEXT DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default warehouses (idempotent)
INSERT INTO warehouses (code, name, location_type, address)
VALUES
  ('MAIN', 'Main Warehouse', 'warehouse', 'No 18A Rumuola/Rumuadaolu Road, Port Harcourt'),
  ('PH-OFFICE', 'Port Harcourt Office', 'office', 'No 18A Rumuola/Rumuadaolu Road, Port Harcourt'),
  ('BAYELSA', 'Bayelsa Branch', 'branch', '223 Chief Melfold Okilo Way, Amarat, Yenegoa, Bayelsa'),
  ('SITE', 'Project / Site Location', 'site', ''),
  ('STORE', 'Store', 'store', '')
ON CONFLICT (code) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_product ON warehouse_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_warehouse ON warehouse_stock(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_warehouse ON inventory_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_movements_created ON inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_grn_supplier ON goods_receipts(supplier);
CREATE INDEX IF NOT EXISTS idx_grn_status ON goods_receipts(verification_status);
CREATE INDEX IF NOT EXISTS idx_receipts_holder ON receipts(current_holder);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_supplier ON receipts(supplier_vendor);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date_received);
CREATE INDEX IF NOT EXISTS idx_custody_receipt ON receipt_custody_events(receipt_id);
CREATE INDEX IF NOT EXISTS idx_schedules_assigned ON work_schedules(assigned_to);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON work_schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_due ON work_schedules(due_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_employee ON daily_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_status ON daily_reports(status);
CREATE INDEX IF NOT EXISTS idx_daily_items_report ON daily_report_items(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_ops_notif_recipient ON operations_notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_ops_notif_read ON operations_notifications(is_read);

-- RLS
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_custody_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_report_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access warehouses" ON warehouses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access warehouse_stock" ON warehouse_stock FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access inventory_movements" ON inventory_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access purchase_orders" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access goods_receipts" ON goods_receipts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access goods_receipt_items" ON goods_receipt_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access receipts" ON receipts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access receipt_custody_events" ON receipt_custody_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access work_schedules" ON work_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access daily_reports" ON daily_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access daily_report_items" ON daily_report_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access monthly_reports" ON monthly_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access operations_notifications" ON operations_notifications FOR ALL USING (true) WITH CHECK (true);
 -- Zorixza — Multi-tenant foundation (Part 6: Businesses, Staff Roles, Plans)
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
 -- Zorixza — Connected Business Operating System layer (Part 8)
-- Run in Supabase SQL Editor AFTER 007. Idempotent.
-- This is the Zorixza-style connective tissue: one business event stream,
-- one generic approval engine, first-class suppliers/customers, generic
-- record links (any object <-> any object), and automation rules.
-- Existing tables (products, POs, GRNs, receipts, schedules, reports,
-- cloud_files, cloud_file_links, audit_logs) are NOT modified destructively.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 55. BUSINESS EVENTS (universal activity stream — single source of truth)
-- Every important domain action writes one row here via lib/operations/events.ts.
-- Dashboards, daily/monthly reports, timelines, notifications and analytics
-- all READ from this stream instead of each module recomputing its own view.
CREATE TABLE IF NOT EXISTS business_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  entity_ref TEXT NOT NULL DEFAULT '',
  actor_user_id TEXT NOT NULL DEFAULT '',
  actor_name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  metadata JSONB DEFAULT '{}',
  related_entity_type TEXT DEFAULT '',
  related_entity_id TEXT DEFAULT '',
  related_entity_ref TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 56. APPROVALS (one reusable workflow engine for PO / GRN / receipt /
-- expense / daily report / monthly report / work request / document)
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_ref TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL DEFAULT 'approve',
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by TEXT NOT NULL DEFAULT '',
  requested_by_name TEXT NOT NULL DEFAULT '',
  assigned_to TEXT NOT NULL DEFAULT '',
  decided_by TEXT DEFAULT '',
  decided_by_name TEXT DEFAULT '',
  decision TEXT DEFAULT '',
  comment TEXT DEFAULT '',
  previous_state TEXT DEFAULT '',
  new_state TEXT DEFAULT '',
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 57. SUPPLIERS (first-class directory; legacy free-text supplier columns
-- remain for backwards compatibility and are matched by name)
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  contact_person TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  division TEXT DEFAULT 'both',
  notes TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 58. CUSTOMERS (first-class directory for sales / CRM linkage)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  division_interest TEXT DEFAULT 'both',
  notes TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 59. RECORD LINKS (generic object graph: any record <-> any record)
-- cloud_file_links stays for drive attachments; this table covers every
-- other relationship: PO<->GRN, GRN<->movement, GRN<->receipt,
-- receipt<->supplier, task<->report, etc. No duplicate data entry.
CREATE TABLE IF NOT EXISTS record_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  link_type TEXT NOT NULL DEFAULT 'related',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_type, source_id, target_type, target_id, link_type)
);

-- 60. AUTOMATION RULES (one engine; evaluated by /api/cron/operations-reminders
-- and /api/automation/evaluate — never scattered custom logic)
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_key TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}',
  last_fired_at TIMESTAMPTZ,
  fire_count NUMERIC NOT NULL DEFAULT 0,
  updated_by TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default automation rules (thresholds editable in Admin later)
INSERT INTO automation_rules (rule_key, is_enabled, config, updated_by)
VALUES
  ('low_stock_alert', true, '{"notify_role":"manager","auto_create_approval":false}', 'seed'),
  ('receipt_held_reminder_days', true, '{"days":3}', 'seed'),
  ('daily_report_due', true, '{"notify_employee":true,"notify_manager":true}', 'seed'),
  ('task_overdue', true, '{"notify_assignee":true}', 'seed'),
  ('storage_quota_warning', true, '{"levels":[80,90,100]}', 'seed')
ON CONFLICT (rule_key) DO NOTHING;

-- Backfill suppliers from legacy free-text columns (names only, idempotent)
INSERT INTO suppliers (name, created_by)
SELECT DISTINCT supplier, 'seed' FROM purchase_orders WHERE supplier IS NOT NULL AND supplier <> ''
ON CONFLICT (name) DO NOTHING;
INSERT INTO suppliers (name, created_by)
SELECT DISTINCT supplier, 'seed' FROM goods_receipts WHERE supplier IS NOT NULL AND supplier <> ''
ON CONFLICT (name) DO NOTHING;
INSERT INTO suppliers (name, created_by)
SELECT DISTINCT supplier_vendor, 'seed' FROM receipts WHERE supplier_vendor IS NOT NULL AND supplier_vendor <> ''
ON CONFLICT (name) DO NOTHING;
INSERT INTO suppliers (name, created_by)
SELECT DISTINCT supplier, 'seed' FROM products WHERE supplier IS NOT NULL AND supplier <> ''
ON CONFLICT (name) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_type ON business_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_entity ON business_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_actor ON business_events(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON business_events(created_at);
CREATE INDEX IF NOT EXISTS idx_approvals_entity ON approvals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_assigned ON approvals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_record_links_source ON record_links(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_record_links_target ON record_links(target_type, target_id);

-- RLS
ALTER TABLE business_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access business_events" ON business_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access approvals" ON approvals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access record_links" ON record_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access automation_rules" ON automation_rules FOR ALL USING (true) WITH CHECK (true);
 -- Zorixza - WhatsApp Inbox persistence (Part 9)
-- Run in Supabase SQL Editor AFTER 008. Idempotent.
-- Business scoping is enforced in API code (business_id on every query).
-- Rows with business_id NULL are quarantined inbound from unmapped sender
-- numbers: never listed, never leaked, visible only for manual claiming.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 66. WHATSAPP CHANNELS (sender-number → business mapping for webhooks)
CREATE TABLE IF NOT EXISTS whatsapp_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  phone_number_id TEXT NOT NULL,
  display_phone TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, phone_number_id)
);
CREATE INDEX IF NOT EXISTS idx_wa_channels_number ON whatsapp_channels(phone_number_id);

-- 67. WHATSAPP CONVERSATIONS (one row per contact phone per business)
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  phone TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  last_preview TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wa_conv_business ON whatsapp_conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_wa_conv_phone ON whatsapp_conversations(phone);
CREATE INDEX IF NOT EXISTS idx_wa_conv_last ON whatsapp_conversations(last_message_at DESC);

-- 68. WHATSAPP MESSAGES (immutable ledger of both directions)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'received',
  provider_message_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wa_msg_conv ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_wa_msg_created ON whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_msg_provider ON whatsapp_messages(provider_message_id);
 -- Roshanal AI / Zorixza - Sales Module (Part 10: quotations, orders, waybills, deliveries, invoices)
-- STATUS: VERSIONED, PENDING APPLY — run in Supabase SQL Editor AFTER 001-009.
-- Covers the P8 chain: quotation → approval → sales order → stock reservation →
-- waybill/delivery → invoice → payment → receipt → AR posting.
-- Idempotent: uses IF NOT EXISTS. No destructive statements.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 66. SALES QUOTATIONS (header; lines in sales_quotation_items)
CREATE TABLE IF NOT EXISTS sales_quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  salesperson_user_id TEXT DEFAULT '',
  salesperson_name TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','rejected','accepted','expired','converted','cancelled')),
  valid_until DATE,
  subtotal_naira NUMERIC NOT NULL DEFAULT 0,
  discount_naira NUMERIC NOT NULL DEFAULT 0,
  tax_naira NUMERIC NOT NULL DEFAULT 0,
  total_naira NUMERIC NOT NULL DEFAULT 0,
  terms TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
  converted_order_id UUID,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_quotations_customer ON sales_quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_quotations_status ON sales_quotations(status);

-- 67. SALES QUOTATION ITEMS
CREATE TABLE IF NOT EXISTS sales_quotation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID NOT NULL REFERENCES sales_quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price_naira NUMERIC NOT NULL DEFAULT 0,
  discount_naira NUMERIC NOT NULL DEFAULT 0,
  line_total_naira NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_quotation_items_quote ON sales_quotation_items(quotation_id);

-- 68. SALES ORDERS (header; fulfilment reserves warehouse stock)
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  quotation_id UUID REFERENCES sales_quotations(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  delivery_address TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','confirmed','reserved','partially_fulfilled','fulfilled','cancelled')),
  subtotal_naira NUMERIC NOT NULL DEFAULT 0,
  discount_naira NUMERIC NOT NULL DEFAULT 0,
  tax_naira NUMERIC NOT NULL DEFAULT 0,
  total_naira NUMERIC NOT NULL DEFAULT 0,
  expected_date DATE,
  notes TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);

-- 69. SALES ORDER ITEMS (each line may reserve stock via inventory reservation)
CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 1,
  fulfilled_quantity NUMERIC NOT NULL DEFAULT 0,
  reserved_quantity NUMERIC NOT NULL DEFAULT 0,
  unit_price_naira NUMERIC NOT NULL DEFAULT 0,
  line_total_naira NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_order ON sales_order_items(order_id);

-- 70. WAYBILLS (paper elimination: create / upload / scan → review → post)
CREATE TABLE IF NOT EXISTS waybills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  waybill_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  salesperson_name TEXT DEFAULT '',
  delivery_location TEXT DEFAULT '',
  vehicle TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_review','pending_approval','approved','rejected','dispatched','delivered','returned','damaged')),
  source TEXT NOT NULL DEFAULT 'created' CHECK (source IN ('created','uploaded','scanned')),
  ocr_confidence NUMERIC,
  ocr_payload JSONB,
  notes TEXT DEFAULT '',
  approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_waybills_status ON waybills(status);
CREATE INDEX IF NOT EXISTS idx_waybills_customer ON waybills(customer_id);

-- 71. WAYBILL ITEMS
CREATE TABLE IF NOT EXISTS waybill_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  waybill_id UUID NOT NULL REFERENCES waybills(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_waybill_items_waybill ON waybill_items(waybill_id);

-- 72. DELIVERIES (dispatch → proof of delivery → invoice trigger)
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_number TEXT UNIQUE NOT NULL,
  waybill_id UUID REFERENCES waybills(id) ON DELETE SET NULL,
  order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','dispatched','delivered','failed','returned')),
  delivered_at TIMESTAMPTZ,
  received_by TEXT DEFAULT '',
  signature_url TEXT,
  notes TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 73. SALES INVOICES (numbered, allocated against receipts → AR)
CREATE TABLE IF NOT EXISTS sales_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
  delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','partially_paid','paid','overdue','cancelled')),
  subtotal_naira NUMERIC NOT NULL DEFAULT 0,
  discount_naira NUMERIC NOT NULL DEFAULT 0,
  tax_naira NUMERIC NOT NULL DEFAULT 0,
  total_naira NUMERIC NOT NULL DEFAULT 0,
  amount_paid_naira NUMERIC NOT NULL DEFAULT 0,
  due_date DATE,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer ON sales_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_status ON sales_invoices(status);

-- 74. SALES INVOICE ITEMS
CREATE TABLE IF NOT EXISTS sales_invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price_naira NUMERIC NOT NULL DEFAULT 0,
  line_total_naira NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_items_invoice ON sales_invoice_items(invoice_id);
 -- Roshanal AI / Zorixza - Accounting Module (Part 11: CoA, journals, ledger, AR/AP, banking)
-- STATUS: VERSIONED, PENDING APPLY — run in Supabase SQL Editor AFTER 010.
-- Covers the P10 core: double-entry books where DEBITS = CREDITS on every
-- posted transaction. No ledger balance is ever mutated without a journal.
-- Idempotent: uses IF NOT EXISTS. No destructive statements.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 75. CHART OF ACCOUNTS (hierarchical: assets, liabilities, equity, income, cost_of_sales, expenses)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset','liability','equity','income','cost_of_sales','expense')),
  parent_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
  is_postable BOOLEAN NOT NULL DEFAULT true,
  opening_balance_naira NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coa_parent ON chart_of_accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_coa_type ON chart_of_accounts(account_type);

-- 76. FINANCIAL PERIODS (closed periods reject ordinary postings)
CREATE TABLE IF NOT EXISTS financial_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','locked')),
  closed_by TEXT DEFAULT '',
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 77. JOURNAL ENTRIES (header; balanced by journal_lines)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_number TEXT UNIQUE NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_id UUID REFERENCES financial_periods(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  source_type TEXT DEFAULT '' CHECK (source_type IN ('','manual','sales','purchase','payment','receipt','payroll','inventory','depreciation','adjustment','opening')),
  source_id TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','posted','reversed')),
  approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
  created_by TEXT DEFAULT '',
  posted_by TEXT DEFAULT '',
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_journals_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journals_source ON journal_entries(source_type, source_id);

-- 78. JOURNAL LINES (each entry must balance: SUM(debit) = SUM(credit))
CREATE TABLE IF NOT EXISTS journal_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
  debit_naira NUMERIC NOT NULL DEFAULT 0 CHECK (debit_naira >= 0),
  credit_naira NUMERIC NOT NULL DEFAULT 0 CHECK (credit_naira >= 0),
  narration TEXT DEFAULT '',
  CHECK (debit_naira > 0 OR credit_naira > 0),
  CHECK (NOT (debit_naira > 0 AND credit_naira > 0))
);
CREATE INDEX IF NOT EXISTS idx_journal_lines_journal ON journal_lines(journal_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_lines(account_id);

-- 79. BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  account_number TEXT DEFAULT '',
  bank_name TEXT DEFAULT '',
  account_type TEXT NOT NULL DEFAULT 'bank' CHECK (account_type IN ('bank','cash','mobile_money')),
  currency TEXT NOT NULL DEFAULT 'NGN',
  opening_balance_naira NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 80. BANK TRANSACTIONS (feeds/imports + system postings; reconciled, never edited silently)
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  txn_date DATE NOT NULL,
  description TEXT DEFAULT '',
  reference TEXT DEFAULT '',
  debit_naira NUMERIC NOT NULL DEFAULT 0,
  credit_naira NUMERIC NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','import','system')),
  matched_journal_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  reconciled BOOLEAN NOT NULL DEFAULT false,
  reconciliation_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bank_txns_account ON bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_txns_reconciled ON bank_transactions(reconciled);

-- 81. BANK RECONCILIATIONS (period approval with audit trail)
CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  period_label TEXT NOT NULL DEFAULT '',
  statement_balance_naira NUMERIC NOT NULL DEFAULT 0,
  system_balance_naira NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','reviewed','approved')),
  approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
  reconciled_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 82. CUSTOMER PAYMENTS (allocated against sales_invoices → AR → bank → GL)
CREATE TABLE IF NOT EXISTS customer_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  method TEXT NOT NULL DEFAULT 'transfer' CHECK (method IN ('cash','transfer','card','cheque','other')),
  amount_naira NUMERIC NOT NULL CHECK (amount_naira > 0),
  reference TEXT DEFAULT '',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  journal_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customer_payments_customer ON customer_payments(customer_id);

-- 83. PAYMENT ALLOCATIONS (which invoice lines each payment settles)
CREATE TABLE IF NOT EXISTS payment_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES customer_payments(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
  amount_naira NUMERIC NOT NULL CHECK (amount_naira > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(payment_id, invoice_id)
);

-- 84. SUPPLIER BILLS (AP documents from goods receipts / direct bills)
CREATE TABLE IF NOT EXISTS supplier_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT NOT NULL DEFAULT '',
  goods_receipt_id UUID REFERENCES goods_receipts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','partially_paid','paid','overdue','cancelled')),
  subtotal_naira NUMERIC NOT NULL DEFAULT 0,
  tax_naira NUMERIC NOT NULL DEFAULT 0,
  total_naira NUMERIC NOT NULL DEFAULT 0,
  amount_paid_naira NUMERIC NOT NULL DEFAULT 0,
  due_date DATE,
  journal_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_supplier_bills_supplier ON supplier_bills(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_bills_status ON supplier_bills(status);

-- 85. BUDGETS (departments / branches / cost centres, periods, actual-vs-budget)
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  account_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
  department TEXT DEFAULT '',
  branch TEXT DEFAULT '',
  period_label TEXT NOT NULL DEFAULT '',
  budgeted_naira NUMERIC NOT NULL DEFAULT 0,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
 -- Roshanal AI / Zorixza - HR + AuditIQ foundations (Part 12)
-- STATUS: VERSIONED, PENDING APPLY — run in Supabase SQL Editor AFTER 011.
-- Covers P12–P15 (HR core, attendance/leave, payroll) and P11 (AuditIQ
-- engagements, working papers, findings). Staff directory already reads the
-- live users/business_members tables; these add the operational records.
-- Idempotent: uses IF NOT EXISTS. No destructive statements.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 86. DEPARTMENTS & POSITIONS
CREATE TABLE IF NOT EXISTS hr_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  head_user_id TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hr_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES hr_departments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  level TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 87. EMPLOYEE RECORDS (extends users with HR profile; users.id is the link)
CREATE TABLE IF NOT EXISTS hr_employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  employee_code TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES hr_departments(id) ON DELETE SET NULL,
  position_id UUID REFERENCES hr_positions(id) ON DELETE SET NULL,
  manager_user_id TEXT DEFAULT '',
  employment_type TEXT NOT NULL DEFAULT 'full_time' CHECK (employment_type IN ('full_time','part_time','contract','intern')),
  hire_date DATE,
  exit_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','on_leave','suspended','exited')),
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  emergency_contact TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 88. ATTENDANCE (device/API/CSV imports reconcile against shifts + leave)
CREATE TABLE IF NOT EXISTS hr_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  work_date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','device','import')),
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','late','half_day','on_leave')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, work_date, source)
);
CREATE INDEX IF NOT EXISTS idx_hr_attendance_user ON hr_attendance(user_id, work_date);

-- 89. LEAVE TYPES + REQUESTS (request → approval → balance → payroll linkage)
CREATE TABLE IF NOT EXISTS hr_leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  annual_days NUMERIC NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hr_leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  leave_type_id UUID REFERENCES hr_leave_types(id) ON DELETE SET NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  days NUMERIC NOT NULL DEFAULT 0,
  reason TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hr_leave_user ON hr_leave_requests(user_id, status);

-- 90. PAYROLL RUNS + PAYSLIPS (jurisdiction-configured components; approval before posting)
CREATE TABLE IF NOT EXISTS hr_payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_number TEXT UNIQUE NOT NULL,
  period_label TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','posted','cancelled')),
  total_gross_naira NUMERIC NOT NULL DEFAULT 0,
  total_deductions_naira NUMERIC NOT NULL DEFAULT 0,
  total_net_naira NUMERIC NOT NULL DEFAULT 0,
  approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
  journal_id UUID,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hr_payslips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES hr_payroll_runs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  employee_name TEXT NOT NULL DEFAULT '',
  earnings JSONB NOT NULL DEFAULT '[]',
  deductions JSONB NOT NULL DEFAULT '[]',
  gross_naira NUMERIC NOT NULL DEFAULT 0,
  deductions_naira NUMERIC NOT NULL DEFAULT 0,
  net_naira NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(run_id, user_id)
);

-- 91. AUDITIQ ENGAGEMENTS (clients + scoped audit jobs)
CREATE TABLE IF NOT EXISTS audit_engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_code TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL DEFAULT '',
  client_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  engagement_type TEXT NOT NULL DEFAULT 'statutory_audit' CHECK (engagement_type IN ('statutory_audit','review','compilation','special')),
  period_label TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','fieldwork','review','partner_review','signed_off','archived')),
  lead_user_id TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 92. AUDIT WORKING PAPERS (reviewer comments + evidence links)
CREATE TABLE IF NOT EXISTS audit_workpapers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_id UUID NOT NULL REFERENCES audit_engagements(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  section TEXT DEFAULT '',
  body TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','reviewed','signed_off')),
  reviewer_user_id TEXT DEFAULT '',
  evidence_file_id UUID REFERENCES cloud_files(id) ON DELETE SET NULL,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_workpapers_eng ON audit_workpapers(engagement_id);

-- 93. AUDIT FINDINGS (every AI/human finding carries evidence + confidence + review state)
CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_id UUID NOT NULL REFERENCES audit_engagements(id) ON DELETE CASCADE,
  finding_type TEXT NOT NULL DEFAULT 'other' CHECK (finding_type IN ('duplicate','gap','anomaly','unsupported','unusual','other')),
  title TEXT NOT NULL DEFAULT '',
  detail TEXT DEFAULT '',
  confidence NUMERIC,
  evidence_ref TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_review','resolved','waived')),
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_findings_eng ON audit_findings(engagement_id, status);
 -- Roshanal AI / Zorixza - Field, Support, Assets, Manufacturing, Fleet, Recruitment (Part 13)
-- STATUS: VERSIONED, PENDING APPLY — run in Supabase SQL Editor AFTER 012.
-- Backs P18–P20 (field/installation/support/assets/manufacturing/fleet/mileage)
-- and P13 (recruitment). work_schedules stays the dispatch queue; these tables
-- carry the job-level detail (checklists, materials, photos, sign-off).
-- Idempotent: uses IF NOT EXISTS. No destructive statements.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 94. SERVICE JOBS (field service + installation dispatch detail)
CREATE TABLE IF NOT EXISTS service_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_number TEXT UNIQUE NOT NULL,
  schedule_id UUID REFERENCES work_schedules(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  site_address TEXT DEFAULT '',
  site_gps_lat NUMERIC,
  site_gps_lng NUMERIC,
  job_type TEXT NOT NULL DEFAULT 'field_service' CHECK (job_type IN ('field_service','installation','maintenance')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','dispatched','in_progress','on_hold','completed','cancelled')),
  assigned_team TEXT DEFAULT '',
  technician_user_id TEXT DEFAULT '',
  vehicle TEXT DEFAULT '',
  scheduled_for DATE,
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  completion_notes TEXT DEFAULT '',
  customer_signature_url TEXT,
  completion_certificate_url TEXT,
  invoice_ref TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_service_jobs_status ON service_jobs(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_service_jobs_customer ON service_jobs(customer_id);

-- 95. JOB CHECKLISTS
CREATE TABLE IF NOT EXISTS job_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
  item TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  is_done BOOLEAN NOT NULL DEFAULT false,
  done_by TEXT DEFAULT '',
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_job_checklists_job ON job_checklists(job_id);

-- 96. JOB MATERIALS (issues flow from inventory; cost flows to the job)
CREATE TABLE IF NOT EXISTS job_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_cost_naira NUMERIC NOT NULL DEFAULT 0,
  movement_ref TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_job_materials_job ON job_materials(job_id);

-- 97. JOB PHOTOS & SIGNATURES (evidence attached to the job)
CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
  file_id UUID REFERENCES cloud_files(id) ON DELETE SET NULL,
  caption TEXT DEFAULT '',
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT DEFAULT ''
);

-- 98. SUPPORT TICKETS (intake → SLA → resolution → satisfaction)
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','assigned','in_progress','waiting_customer','resolved','closed','reopened')),
  assigned_to TEXT DEFAULT '',
  sla_due_at TIMESTAMPTZ,
  resolution TEXT DEFAULT '',
  satisfaction INTEGER CHECK (satisfaction IS NULL OR (satisfaction >= 1 AND satisfaction <= 5)),
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status, priority);

-- 99. ASSETS (equipment, vehicles, tools, office assets with custody)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'equipment',
  serial_number TEXT DEFAULT '',
  model TEXT DEFAULT '',
  purchase_cost_naira NUMERIC NOT NULL DEFAULT 0,
  purchase_date DATE,
  location TEXT DEFAULT '',
  custodian_user_id TEXT DEFAULT '',
  department TEXT DEFAULT '',
  warranty_until DATE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','assigned','maintenance','retired','disposed','lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);

-- 100. ASSET ASSIGNMENTS (who holds what, since when)
CREATE TABLE IF NOT EXISTS asset_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT '',
  user_name TEXT DEFAULT '',
  project_ref TEXT DEFAULT '',
  job_id UUID REFERENCES service_jobs(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  returned_at TIMESTAMPTZ,
  created_by TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_asset ON asset_assignments(asset_id);

-- 101. ASSET MAINTENANCE
CREATE TABLE IF NOT EXISTS asset_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  service_type TEXT DEFAULT 'routine',
  vendor TEXT DEFAULT '',
  cost_naira NUMERIC NOT NULL DEFAULT 0,
  serviced_on DATE NOT NULL DEFAULT CURRENT_DATE,
  next_due_on DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 102. BILLS OF MATERIALS (manufacturing recipes)
CREATE TABLE IF NOT EXISTS boms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  component_product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  wastage_percent NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, component_product_id)
);

-- 103. WORK ORDERS (produce finished goods from components)
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT '',
  quantity_to_make NUMERIC NOT NULL DEFAULT 1,
  quantity_made NUMERIC NOT NULL DEFAULT 0,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','released','in_progress','completed','cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 104. VEHICLES (fleet register)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate_number TEXT UNIQUE NOT NULL,
  make_model TEXT DEFAULT '',
  vehicle_type TEXT DEFAULT 'van',
  driver_user_id TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','maintenance','retired')),
  insurance_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 105. TRIPS (dispatch, routes, delivery linkage, mileage capture)
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  driver_user_id TEXT DEFAULT '',
  purpose TEXT DEFAULT '',
  origin TEXT DEFAULT '',
  destination TEXT DEFAULT '',
  start_odometer NUMERIC,
  end_odometer NUMERIC,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','cancelled')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 106. FUEL RECORDS (consumption + cost per km)
CREATE TABLE IF NOT EXISTS fuel_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  litres NUMERIC NOT NULL DEFAULT 0,
  amount_naira NUMERIC NOT NULL DEFAULT 0,
  odometer NUMERIC,
  filled_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 107. MILEAGE LOGS (staff travel → approval → reimbursement)
CREATE TABLE IF NOT EXISTS mileage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT '',
  trip_date DATE NOT NULL DEFAULT CURRENT_DATE,
  origin TEXT DEFAULT '',
  destination TEXT DEFAULT '',
  kilometres NUMERIC NOT NULL DEFAULT 0,
  purpose TEXT DEFAULT '',
  customer_ref TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected','reimbursed')),
  approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mileage_user ON mileage_logs(user_id, status);

-- 108. RECRUITMENT REQUISITIONS
CREATE TABLE IF NOT EXISTS job_requisitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requisition_number TEXT UNIQUE NOT NULL,
  position_title TEXT NOT NULL DEFAULT '',
  department TEXT DEFAULT '',
  headcount INTEGER NOT NULL DEFAULT 1,
  justification TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','rejected','fulfilled','cancelled')),
  approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 109. CANDIDATES (pipeline, CVs, scores)
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requisition_id UUID REFERENCES job_requisitions(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  cv_file_id UUID REFERENCES cloud_files(id) ON DELETE SET NULL,
  stage TEXT NOT NULL DEFAULT 'applied' CHECK (stage IN ('applied','screening','interview','offer','hired','rejected')),
  score INTEGER CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_candidates_req ON candidates(requisition_id, stage);

-- 110. INTERVIEWS & OFFERS
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  panel TEXT DEFAULT '',
  scheduled_at TIMESTAMPTZ,
  feedback TEXT DEFAULT '',
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  salary_naira NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','declined','expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
 -- Roshanal AI / Zorixza - Money Module (Part 14: expenses, fixed assets, loans, tax, POS)
-- STATUS: VERSIONED, PENDING APPLY — run in Supabase SQL Editor AFTER 013.
-- Extends the P10 accounting core (011): staff claims, asset books, borrowings,
-- jurisdiction tax and counter sales. All postings flow through journal_entries.
-- Idempotent: uses IF NOT EXISTS. No destructive statements.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 111. EXPENSE CLAIMS (receipts → approval → reimbursement → GL)
CREATE TABLE IF NOT EXISTS expense_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_number TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL DEFAULT '',
  user_name TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  amount_naira NUMERIC NOT NULL CHECK (amount_naira > 0),
  spent_on DATE NOT NULL DEFAULT CURRENT_DATE,
  project_ref TEXT DEFAULT '',
  receipt_file_id UUID REFERENCES cloud_files(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected','reimbursed')),
  approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
  journal_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_expense_claims_user ON expense_claims(user_id, status);

-- 112. FIXED ASSET REGISTER (financial book values; operational data lives in assets)
CREATE TABLE IF NOT EXISTS fixed_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  asset_code TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'equipment',
  cost_naira NUMERIC NOT NULL DEFAULT 0,
  salvage_naira NUMERIC NOT NULL DEFAULT 0,
  useful_life_months INTEGER NOT NULL DEFAULT 36,
  method TEXT NOT NULL DEFAULT 'straight_line' CHECK (method IN ('straight_line','reducing_balance')),
  capitalised_on DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disposed','written_off')),
  accumulated_depreciation_naira NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 113. DEPRECIATION RUNS (posted to GL, never edited silently)
CREATE TABLE IF NOT EXISTS depreciation_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_label TEXT NOT NULL DEFAULT '',
  total_naira NUMERIC NOT NULL DEFAULT 0,
  journal_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','posted')),
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 114. LOANS (borrowings with amortisation)
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_ref TEXT UNIQUE NOT NULL,
  lender TEXT NOT NULL DEFAULT '',
  principal_naira NUMERIC NOT NULL CHECK (principal_naira > 0),
  annual_rate_percent NUMERIC NOT NULL DEFAULT 0,
  tenure_months INTEGER NOT NULL DEFAULT 12,
  disbursed_on DATE,
  collateral TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','repaid','defaulted','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 115. LOAN REPAYMENTS (split principal vs interest, posted to GL)
CREATE TABLE IF NOT EXISTS loan_repayments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  due_on DATE NOT NULL,
  principal_naira NUMERIC NOT NULL DEFAULT 0,
  interest_naira NUMERIC NOT NULL DEFAULT 0,
  paid_naira NUMERIC NOT NULL DEFAULT 0,
  paid_on DATE,
  journal_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan ON loan_repayments(loan_id, due_on);

-- 116. TAX PROFILES (jurisdiction-configured VAT/WHT/PAYE rules)
CREATE TABLE IF NOT EXISTS tax_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jurisdiction TEXT NOT NULL DEFAULT 'NG',
  tax_type TEXT NOT NULL CHECK (tax_type IN ('VAT','WHT','PAYE','CIT','other')),
  rate_percent NUMERIC NOT NULL DEFAULT 0,
  applies_to TEXT DEFAULT 'sales',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(jurisdiction, tax_type, applies_to)
);

-- 117. TAX FILINGS (computation drafts → submission log with deadline alerts)
CREATE TABLE IF NOT EXISTS tax_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tax_type TEXT NOT NULL DEFAULT 'VAT',
  period_label TEXT NOT NULL DEFAULT '',
  computed_naira NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','filed','paid','overdue')),
  filed_on DATE,
  receipt_ref TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 118. POS REGISTERS (cash drawers per counter/shift)
CREATE TABLE IF NOT EXISTS pos_registers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Counter 1',
  status TEXT NOT NULL DEFAULT 'closed' CHECK (status IN ('open','closed')),
  opened_by TEXT DEFAULT '',
  opening_float_naira NUMERIC NOT NULL DEFAULT 0,
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 119. POS SALES (each sale issues stock + records tender)
CREATE TABLE IF NOT EXISTS pos_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number TEXT UNIQUE NOT NULL,
  register_id UUID REFERENCES pos_registers(id) ON DELETE SET NULL,
  cashier_user_id TEXT DEFAULT '',
  customer_name TEXT DEFAULT 'Walk-in',
  subtotal_naira NUMERIC NOT NULL DEFAULT 0,
  discount_naira NUMERIC NOT NULL DEFAULT 0,
  total_naira NUMERIC NOT NULL DEFAULT 0,
  tender_method TEXT NOT NULL DEFAULT 'cash' CHECK (tender_method IN ('cash','transfer','card','other')),
  amount_tendered_naira NUMERIC NOT NULL DEFAULT 0,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pos_sales_register ON pos_sales(register_id, created_at);

-- 120. POS SALE ITEMS
CREATE TABLE IF NOT EXISTS pos_sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES pos_sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price_naira NUMERIC NOT NULL DEFAULT 0,
  line_total_naira NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pos_sale_items_sale ON pos_sale_items(sale_id);
 -- Roshanal AI / Zorixza - Industry Verticals (Part 15)
-- STATUS: VERSIONED, PENDING APPLY — run in Supabase SQL Editor AFTER 014.
-- Lean foundations for Construction, School, Property, Healthcare, Hospitality
-- and NGO workspaces. Each vertical reuses core tables (customers, products,
-- receipts, approvals, cloud_files, work_schedules) and adds only its own
-- domain records here.
-- Idempotent: uses IF NOT EXISTS. No destructive statements.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── CONSTRUCTION ─────────────────────────────────────────────
-- 121. SITE PROJECTS
CREATE TABLE IF NOT EXISTS construction_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_code TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  site_location TEXT DEFAULT '',
  contract_value_naira NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('tender','active','on_hold','completed','closed')),
  started_on DATE,
  expected_completion DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 122. BOQ ITEMS
CREATE TABLE IF NOT EXISTS boq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  unit TEXT DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 0,
  rate_naira NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 123. VALUATIONS (interim certificates → invoices)
CREATE TABLE IF NOT EXISTS valuations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL DEFAULT '',
  period_label TEXT DEFAULT '',
  certified_naira NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','certified','invoiced')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── SCHOOL ───────────────────────────────────────────────────
-- 124. STUDENTS
CREATE TABLE IF NOT EXISTS school_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admission_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  class_name TEXT DEFAULT '',
  guardian_name TEXT DEFAULT '',
  guardian_phone TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','graduated','withdrawn','suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 125. FEE INVOICES
CREATE TABLE IF NOT EXISTS school_fee_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  student_id UUID REFERENCES school_students(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL DEFAULT '',
  term_label TEXT DEFAULT '',
  total_naira NUMERIC NOT NULL DEFAULT 0,
  paid_naira NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','partial','paid','overdue')),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_school_fees_student ON school_fee_invoices(student_id, status);

-- 126. RESULTS
CREATE TABLE IF NOT EXISTS school_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES school_students(id) ON DELETE CASCADE,
  term_label TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  score NUMERIC NOT NULL DEFAULT 0,
  grade TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── PROPERTY ─────────────────────────────────────────────────
-- 127. UNITS
CREATE TABLE IF NOT EXISTS property_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_code TEXT UNIQUE NOT NULL,
  block_name TEXT DEFAULT '',
  unit_type TEXT DEFAULT 'flat',
  bedrooms INTEGER DEFAULT 0,
  annual_rent_naira NUMERIC NOT NULL DEFAULT 0,
  condition TEXT DEFAULT 'good',
  occupancy TEXT NOT NULL DEFAULT 'vacant' CHECK (occupancy IN ('vacant','occupied','reserved','maintenance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 128. TENANTS
CREATE TABLE IF NOT EXISTS property_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  kyc_ref TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 129. LEASES
CREATE TABLE IF NOT EXISTS property_leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES property_units(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES property_tenants(id) ON DELETE SET NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  annual_rent_naira NUMERIC NOT NULL DEFAULT 0,
  deposit_naira NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','terminated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── HEALTHCARE ───────────────────────────────────────────────
-- 130. PATIENTS
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  date_of_birth DATE,
  blood_group TEXT DEFAULT '',
  allergies TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 131. ENCOUNTERS
CREATE TABLE IF NOT EXISTS encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_type TEXT DEFAULT 'consultation',
  triage_notes TEXT DEFAULT '',
  diagnosis TEXT DEFAULT '',
  prescription TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','referred')),
  seen_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_encounters_patient ON encounters(patient_id, created_at);

-- ── HOSPITALITY ──────────────────────────────────────────────
-- 132. HOTEL RESERVATIONS
CREATE TABLE IF NOT EXISTS hotel_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_number TEXT UNIQUE NOT NULL,
  guest_name TEXT NOT NULL DEFAULT '',
  guest_phone TEXT DEFAULT '',
  room_number TEXT DEFAULT '',
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','checked_in','checked_out','no_show','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 133. FOLIOS + CHARGES (one bill per stay)
CREATE TABLE IF NOT EXISTS hotel_folios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES hotel_reservations(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL DEFAULT '',
  total_naira NUMERIC NOT NULL DEFAULT 0,
  paid_naira NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','settled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hotel_folio_charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folio_id UUID NOT NULL REFERENCES hotel_folios(id) ON DELETE CASCADE,
  department TEXT DEFAULT 'room',
  description TEXT DEFAULT '',
  amount_naira NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── NGO / FUNDS ──────────────────────────────────────────────
-- 134. GRANTS
CREATE TABLE IF NOT EXISTS grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_code TEXT UNIQUE NOT NULL,
  donor TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  total_naira NUMERIC NOT NULL DEFAULT 0,
  disbursed_naira NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pipeline','active','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 135. BENEFICIARIES
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID REFERENCES grants(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  category TEXT DEFAULT '',
  case_file TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 136. DISBURSEMENTS (approval → payment → acknowledgement)
CREATE TABLE IF NOT EXISTS grant_disbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_id UUID REFERENCES grants(id) ON DELETE SET NULL,
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,
  amount_naira NUMERIC NOT NULL CHECK (amount_naira > 0),
  purpose TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','paid','acknowledged')),
  approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

