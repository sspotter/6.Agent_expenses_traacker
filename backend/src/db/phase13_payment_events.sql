-- Create ENUMs for payment events
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

-- Create the Payment Events table
CREATE TABLE IF NOT EXISTS payment_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL DEFAULT 'default_user',
  entity_type entity_type NOT NULL,
  entity_id uuid NOT NULL,
  event_type event_type NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  event_date date NOT NULL DEFAULT current_date,
  reference_id uuid, -- Link to settlement_id or expense_payment_id
  metadata jsonb DEFAULT '{}'::jsonb, -- For flexible notes like "Settled from May"
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- Allow all access for now (consistent with project policy)
CREATE POLICY "Enable all access for now" ON payment_events
FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_events_entity ON payment_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_user ON payment_events(user_id);
