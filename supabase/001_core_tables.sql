-- Roshanal AI — Supabase Schema (Part 1: Core Tables)
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator')),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. BUSINESS PROFILE
CREATE TABLE IF NOT EXISTS business_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  divisions JSONB DEFAULT '[]',
  contact_info JSONB DEFAULT '{}',
  brand_voice TEXT,
  logo_url TEXT,
  brand_colors TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division TEXT NOT NULL CHECK (division IN ('marine', 'tech')),
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  model TEXT,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  price_naira NUMERIC,
  price_display TEXT,
  images JSONB DEFAULT '[]',
  keywords TEXT[] DEFAULT '{}',
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  availability_note TEXT,
  warranty TEXT,
  installation_required BOOLEAN NOT NULL DEFAULT false,
  installation_area TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TRENDS
CREATE TABLE IF NOT EXISTS trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  topic TEXT,
  description TEXT,
  source TEXT,
  source_url TEXT,
  momentum_score NUMERIC DEFAULT 0,
  division_relevance TEXT CHECK (division_relevance IN ('marine', 'tech', 'both')),
  matched_products TEXT[] DEFAULT '{}',
  is_breaking BOOLEAN NOT NULL DEFAULT false,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active'
);

-- 5. COMPETITORS
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  division TEXT CHECK (division IN ('marine', 'tech', 'both')),
  last_scanned TIMESTAMPTZ,
  intel_report JSONB DEFAULT '{}',
  active_ads JSONB DEFAULT '[]',
  posting_patterns JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. SOCIAL POSTS
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division TEXT CHECK (division IN ('marine', 'tech')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  trend_id UUID REFERENCES trends(id) ON DELETE SET NULL,
  post_type TEXT NOT NULL,
  platform TEXT NOT NULL,
  caption TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  image_url TEXT,
  image_source TEXT,
  cta TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  platform_post_id TEXT,
  engagement JSONB DEFAULT '{}',
  auto_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. UGC ADS
CREATE TABLE IF NOT EXISTS ugc_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division TEXT CHECK (division IN ('marine', 'tech')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  ad_type TEXT NOT NULL,
  platform TEXT NOT NULL,
  headline TEXT NOT NULL,
  primary_text TEXT NOT NULL,
  description TEXT,
  cta_button TEXT NOT NULL,
  video_script TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'used')),
  used_in_campaign BOOLEAN NOT NULL DEFAULT false,
  campaign_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
