-- Drop the old unique constraint that didn't include worker_id
ALTER TABLE public.daily_collections
DROP CONSTRAINT IF EXISTS daily_collections_user_date_key;

-- Drop any other potential conflicting constraints if they verify uniqueness on (user_id, date)
-- (We'll assume the standard one is the problem)

-- Create a new unique constraint including worker_id
-- We use a unique index which acts as a constraint and allows upsert `on conflict` to work.
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_collections_user_worker_date
ON public.daily_collections (user_id, worker_id, date);

-- Add constraint using the index (optional, but good practice for error messages)
-- ALTER TABLE public.daily_collections
-- ADD CONSTRAINT daily_collections_user_worker_date_key UNIQUE USING INDEX idx_daily_collections_user_worker_date;

-- NOTE: Supabase/Postgrest requires an explicit CONSTRAINT for ON CONFLICT or a matching UNIQUE INDEX.
-- The upsert param `on_conflict` matches column names (user_id, worker_id, date).
-- It should find the unique index covering these columns.
