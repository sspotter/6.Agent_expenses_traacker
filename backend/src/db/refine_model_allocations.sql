-- Refinement: Add Settlement Allocation for audit trail
-- Run this in your Supabase SQL Editor

-- Create the Settlement Allocations table
CREATE TABLE settlement_allocations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement_id uuid REFERENCES settlements(id) ON DELETE CASCADE,
  daily_collection_id uuid REFERENCES daily_collections(id) ON DELETE CASCADE,
  amount_applied numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE settlement_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for now" ON settlement_allocations
FOR ALL USING (true) WITH CHECK (true);

-- Add a source_month to settlements if not already there
-- (Check if column exists first to be safe)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settlements' AND column_name='source_month') THEN
        ALTER TABLE settlements ADD COLUMN source_month text;
    END IF;
END $$;
