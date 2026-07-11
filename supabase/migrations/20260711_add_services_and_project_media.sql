-- Extends projects for the 3-image sticky-stack card layout, and adds a
-- new admin-editable services list — same public-read/admin-write RLS
-- pattern as the existing projects table.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url_2 TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url_3 TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category TEXT;

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
