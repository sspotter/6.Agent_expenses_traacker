-- 1. Fix Settlement Allocations (Rename columns to match code)
DO $$ 
BEGIN 
    -- Rename daily_collection_id to collection_id if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settlement_allocations' AND column_name='daily_collection_id') THEN
        ALTER TABLE settlement_allocations RENAME COLUMN daily_collection_id TO collection_id;
    END IF;

    -- Rename amount_applied to allocated_amount if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settlement_allocations' AND column_name='amount_applied') THEN
        ALTER TABLE settlement_allocations RENAME COLUMN amount_applied TO allocated_amount;
    END IF;
END $$;

-- 2. Create payment_events if missing (Fixes 404)
DO $$ BEGIN
    CREATE TYPE entity_type AS ENUM ('DAILY_COLLECTION', 'WEEKLY_EXPENSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('COLLECTED', 'SETTLED', 'PAID', 'CREATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS payment_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL DEFAULT 'default_user',
  entity_type entity_type NOT NULL,
  entity_id uuid NOT NULL,
  event_type event_type NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  event_date date NOT NULL DEFAULT current_date,
  reference_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and Policies for payment_events
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for now" ON payment_events;
CREATE POLICY "Enable all access for now" ON payment_events FOR ALL USING (true) WITH CHECK (true);

-- Ensure settlement_allocations exists if it was missed
CREATE TABLE IF NOT EXISTS settlement_allocations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement_id uuid REFERENCES settlements(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES daily_collections(id) ON DELETE CASCADE,
  allocated_amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure RLS on settlement_allocations
ALTER TABLE settlement_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for now" ON settlement_allocations;
CREATE POLICY "Enable all access for now" ON settlement_allocations FOR ALL USING (true) WITH CHECK (true);
