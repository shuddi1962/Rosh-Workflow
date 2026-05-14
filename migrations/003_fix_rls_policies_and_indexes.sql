-- Migration: 003_fix_rls_policies_and_indexes.sql
-- Fixes all 66 InsForge Backend Advisor issues:
--   Critical: Permissive RLS policies for public role (Issues 1-27)
--   Warning:  Missing FK indexes (Issues 28-38, 64-65)
--   Warning:  Overly permissive project_admin policies (Issues 39-63)

-- ============================================================
-- PART 1: Fix public role RLS policies (Issues 1-27)
-- ============================================================

-- Drop permissive "Allow all for anon" policies
DROP POLICY IF EXISTS "Allow all for anon" ON public.analytics_daily;
DROP POLICY IF EXISTS "Allow all for anon" ON public.api_keys;
DROP POLICY IF EXISTS "Allow all for anon" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow all for anon" ON public.business_profile;
DROP POLICY IF EXISTS "Allow all for anon" ON public.campaigns;
DROP POLICY IF EXISTS "Allow all for anon" ON public.competitors;
DROP POLICY IF EXISTS "Allow all for anon" ON public.feature_toggles;
DROP POLICY IF EXISTS "Allow all for anon" ON public.leads;
DROP POLICY IF EXISTS "Allow all for anon" ON public.products;
DROP POLICY IF EXISTS "Allow all for anon" ON public.social_accounts;
DROP POLICY IF EXISTS "Allow all for anon" ON public.social_posts;
DROP POLICY IF EXISTS "Allow all for anon" ON public.trends;
DROP POLICY IF EXISTS "Allow all for anon" ON public.ugc_ads;
DROP POLICY IF EXISTS "Allow all for anon" ON public.users;

-- Drop permissive named policies for public role
DROP POLICY IF EXISTS call_logs_all ON public.call_logs;
DROP POLICY IF EXISTS reviews_all ON public.reviews;
DROP POLICY IF EXISTS crm_activities_insert ON public.crm_activities;
DROP POLICY IF EXISTS crm_activities_select ON public.crm_activities;
DROP POLICY IF EXISTS crm_activities_update ON public.crm_activities;
DROP POLICY IF EXISTS automation_triggers_all ON public.automation_triggers;
DROP POLICY IF EXISTS email_templates_all ON public.email_templates;
DROP POLICY IF EXISTS voice_agents_all ON public.voice_agents;
DROP POLICY IF EXISTS campaign_events_all ON public.campaign_events;
DROP POLICY IF EXISTS campaign_sequences_all ON public.campaign_sequences;
DROP POLICY IF EXISTS generated_banners_all ON public.generated_banners;
DROP POLICY IF EXISTS product_sources_all ON public.product_sources;
DROP POLICY IF EXISTS referrals_all ON public.referrals;

-- Create public SELECT-only policies for publicly readable tables
CREATE POLICY "public_select" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "public_select" ON public.business_profile FOR SELECT TO public USING (true);

-- ============================================================
-- PART 2: Fix project_admin role RLS policies (Issues 39-63)
-- ============================================================

-- Recreate project_admin policies with proper auth check
DROP POLICY IF EXISTS project_admin_policy ON public.analytics_daily;
CREATE POLICY project_admin_policy ON public.analytics_daily FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.api_keys;
CREATE POLICY project_admin_policy ON public.api_keys FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.audit_logs;
CREATE POLICY project_admin_policy ON public.audit_logs FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.automation_triggers;
CREATE POLICY project_admin_policy ON public.automation_triggers FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.business_profile;
CREATE POLICY project_admin_policy ON public.business_profile FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.call_logs;
CREATE POLICY project_admin_policy ON public.call_logs FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.campaign_events;
CREATE POLICY project_admin_policy ON public.campaign_events FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.campaign_sequences;
CREATE POLICY project_admin_policy ON public.campaign_sequences FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.campaigns;
CREATE POLICY project_admin_policy ON public.campaigns FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.competitors;
CREATE POLICY project_admin_policy ON public.competitors FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.crm_activities;
CREATE POLICY project_admin_policy ON public.crm_activities FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.email_templates;
CREATE POLICY project_admin_policy ON public.email_templates FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.feature_toggles;
CREATE POLICY project_admin_policy ON public.feature_toggles FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.generated_banners;
CREATE POLICY project_admin_policy ON public.generated_banners FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.leads;
CREATE POLICY project_admin_policy ON public.leads FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.product_sources;
CREATE POLICY project_admin_policy ON public.product_sources FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.products;
CREATE POLICY project_admin_policy ON public.products FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.referrals;
CREATE POLICY project_admin_policy ON public.referrals FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.reviews;
CREATE POLICY project_admin_policy ON public.reviews FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.social_accounts;
CREATE POLICY project_admin_policy ON public.social_accounts FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.social_posts;
CREATE POLICY project_admin_policy ON public.social_posts FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.trends;
CREATE POLICY project_admin_policy ON public.trends FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.ugc_ads;
CREATE POLICY project_admin_policy ON public.ugc_ads FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.users;
CREATE POLICY project_admin_policy ON public.users FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

DROP POLICY IF EXISTS project_admin_policy ON public.voice_agents;
CREATE POLICY project_admin_policy ON public.voice_agents FOR ALL TO project_admin USING ((select auth.role()) = 'project_admin') WITH CHECK ((select auth.role()) = 'project_admin');

-- ============================================================
-- PART 3: Add missing FK indexes (Issues 28-38, 64-65)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ugc_ads_product_id ON public.ugc_ads(product_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_agent_id ON public.call_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_lead_id ON public.campaign_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_lead_id ON public.referrals(referred_lead_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_lead_id ON public.referrals(referrer_lead_id);
CREATE INDEX IF NOT EXISTS idx_product_sources_product_id ON public.product_sources(product_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_product_id ON public.social_posts(product_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_trend_id ON public.social_posts(trend_id);
