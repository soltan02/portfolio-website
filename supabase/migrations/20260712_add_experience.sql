-- Work/experience history — a portfolio doubling as a CV needs a proper
-- background section, not just projects. Same public-read/admin-write
-- pattern as services/projects.
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
