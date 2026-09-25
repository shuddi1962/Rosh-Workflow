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
