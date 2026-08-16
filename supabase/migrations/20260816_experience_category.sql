-- ============================================================
-- Add `category` to the experience table so the portfolio can
-- clearly separate EDUCATION (study) from CAREER (work).
-- Values: 'education' | 'career'  (default 'career')
-- ============================================================

ALTER TABLE experience ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'career';

DO $$ BEGIN
  ALTER TABLE experience ADD CONSTRAINT experience_category_check
    CHECK (category IN ('education', 'career'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Backfill any rows that predate this column (they were all "career").
UPDATE experience SET category = 'career' WHERE category IS NULL;
