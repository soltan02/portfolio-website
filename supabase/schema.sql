-- ============================================================
-- PORTFOLIO SITE — schema
-- Single admin user (no public sign-up); public can only read.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILE (single row)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  passions TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  contact_email TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profile_select_public ON profile;
CREATE POLICY profile_select_public ON profile FOR SELECT USING (true);

DROP POLICY IF EXISTS profile_write_admin ON profile;
CREATE POLICY profile_write_admin ON profile
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tech_tags TEXT[] NOT NULL DEFAULT '{}',
  category TEXT,
  image_url TEXT,
  image_url_2 TEXT,
  image_url_3 TEXT,
  live_url TEXT,
  repo_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS projects_select_public ON projects;
CREATE POLICY projects_select_public ON projects FOR SELECT USING (true);

DROP POLICY IF EXISTS projects_write_admin ON projects;
CREATE POLICY projects_write_admin ON projects
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- SERVICES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS services_select_public ON services;
CREATE POLICY services_select_public ON services FOR SELECT USING (true);

DROP POLICY IF EXISTS services_write_admin ON services;
CREATE POLICY services_write_admin ON services
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- EXPERIENCE (work/background history — CV-style)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  period TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE experience ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS experience_select_public ON experience;
CREATE POLICY experience_select_public ON experience FOR SELECT USING (true);

DROP POLICY IF EXISTS experience_write_admin ON experience;
CREATE POLICY experience_write_admin ON experience
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Seed the single profile row if the table is empty.
INSERT INTO profile (full_name)
SELECT ''
WHERE NOT EXISTS (SELECT 1 FROM profile);

-- ─────────────────────────────────────────────
-- STORAGE — portfolio-media (public read, admin write)
-- Bucket itself is created via the Storage API, not SQL:
--   POST /storage/v1/bucket {"id":"portfolio-media","public":true}
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS portfolio_media_select ON storage.objects;
CREATE POLICY portfolio_media_select ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS portfolio_media_write ON storage.objects;
CREATE POLICY portfolio_media_write ON storage.objects
  FOR ALL USING (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'portfolio-media' AND auth.role() = 'authenticated');
