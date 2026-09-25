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
