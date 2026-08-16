-- ============================================================
-- PORTFOLIO SITE — harden RLS to the single admin account
--
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor).
-- Replace <ADMIN_UID> below if you sign in with a different
-- Supabase Auth account.
-- ============================================================

-- Admin identity: the only account allowed to write content.
-- Current admin: preview-admin@example.com
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_portfolio_admin') THEN
    CREATE FUNCTION public.is_portfolio_admin()
    RETURNS BOOLEAN
    LANGUAGE sql
    SECURITY DEFINER
    STABLE
    SET search_path = public
    AS $$ SELECT auth.uid() = '7f586d33-2a8d-4eed-81ed-d6f60ea68071'::uuid $$;
  END IF;
END
$$;

-- ─── PROFILE ───────────────────────────────────────────────
DROP POLICY IF EXISTS profile_write_admin ON profile;
CREATE POLICY profile_write_admin ON profile
  FOR ALL USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());

-- ─── PROJECTS ──────────────────────────────────────────────
DROP POLICY IF EXISTS projects_write_admin ON projects;
CREATE POLICY projects_write_admin ON projects
  FOR ALL USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());

-- ─── SERVICES ──────────────────────────────────────────────
DROP POLICY IF EXISTS services_write_admin ON services;
CREATE POLICY services_write_admin ON services
  FOR ALL USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());

-- ─── EXPERIENCE ────────────────────────────────────────────
DROP POLICY IF EXISTS experience_write_admin ON experience;
CREATE POLICY experience_write_admin ON experience
  FOR ALL USING (public.is_portfolio_admin()) WITH CHECK (public.is_portfolio_admin());

-- ─── STORAGE (portfolio-media) ─────────────────────────────
DROP POLICY IF EXISTS portfolio_media_write ON storage.objects;
CREATE POLICY portfolio_media_write ON storage.objects
  FOR ALL USING (bucket_id = 'portfolio-media' AND public.is_portfolio_admin())
  WITH CHECK (bucket_id = 'portfolio-media' AND public.is_portfolio_admin());

-- ─── ALSO RECOMMENDED (manual, in Dashboard > Auth > Settings) ──
-- 1. Turn OFF "Allow new users to sign up" (currently enabled —
--    anyone can create an account and, before this migration runs,
--    modify your portfolio content).
-- 2. Optionally restrict to your real admin email address.
