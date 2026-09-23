-- Roshanal AI / GrowPilot — Operations Module (Part 5: Inventory, Receipt Custody & Staff Reporting)
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
