-- Add is_expected_override column to daily_collections
ALTER TABLE public.daily_collections
ADD COLUMN IF NOT EXISTS is_expected_override BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional: Comments
COMMENT ON COLUMN daily_collections.is_expected_override IS 'Flag indicating if the expected amount was manually overridden for this specific day';

-- Backfill expected_amount for existing records if they are 0 (assuming 100 was the implicit default)
-- This is a one-time fix for legacy data which might have 0 or null expected_amount but implicitly meant 100.
-- BE CAREFUL: Only do this if you are sure 0 isn't a valid "no expectation" state.
-- For now, we will leave it, as the app logic handles defaults. 
-- But we can ensure that future inserts without override flag are False.
