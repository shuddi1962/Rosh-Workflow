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
