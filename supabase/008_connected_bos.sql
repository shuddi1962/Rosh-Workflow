-- GrowPilot — Connected Business Operating System layer (Part 8)
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
