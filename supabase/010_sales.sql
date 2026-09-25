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
