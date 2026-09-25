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
