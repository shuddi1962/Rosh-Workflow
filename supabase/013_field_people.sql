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
