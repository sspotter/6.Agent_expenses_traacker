-- =========================================
-- GLOBAL DEFAULTS
-- =========================================

alter default privileges in schema public
grant all on tables to postgres, anon, authenticated, service_role;

-- =========================================
-- ENUM TYPES
-- =========================================

DO $$ BEGIN
    CREATE TYPE daily_status AS ENUM ('FULL', 'PARTIAL', 'MISSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE entity_type AS ENUM ('DAILY_COLLECTION', 'WEEKLY_EXPENSE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('COLLECTED', 'SETTLED', 'PAID', 'CREATED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =========================================
-- WORKERS (Profiles)
-- =========================================

CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all (dev)" ON workers FOR ALL USING (true) WITH CHECK (true);

-- =========================================
-- DAILY COLLECTIONS (Income)
-- =========================================

CREATE TABLE IF NOT EXISTS daily_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'default_user',
  worker_id UUID NOT NULL REFERENCES workers(id),
  date date NOT NULL,
  expected_amount numeric NOT NULL DEFAULT 0,
  collected_amount numeric NOT NULL DEFAULT 0,
  status daily_status NOT NULL DEFAULT 'MISSED',
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, worker_id, date)
);

ALTER TABLE daily_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all (dev)" ON daily_collections FOR ALL USING (true) WITH CHECK (true);

-- =========================================
-- WEEKLY EXPENSES
-- =========================================

CREATE TABLE IF NOT EXISTS weekly_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'default_user',
  worker_id UUID NOT NULL REFERENCES workers(id),
  week_start_date date NOT NULL,
  week_end_date date,
  amount numeric NOT NULL DEFAULT 0,
  category text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE weekly_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all (dev)" ON weekly_expenses FOR ALL USING (true) WITH CHECK (true);

-- =========================================
-- SETTLEMENTS (Late Income)
-- =========================================

CREATE TABLE IF NOT EXISTS settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'default_user',
  worker_id UUID NOT NULL REFERENCES workers(id),
  settlement_date date NOT NULL DEFAULT current_date,
  amount numeric NOT NULL DEFAULT 0,
  applied_to_month text, -- YYYY-MM
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all (dev)" ON settlements FOR ALL USING (true) WITH CHECK (true);

-- =========================================
-- SETTLEMENT ALLOCATIONS
-- =========================================

CREATE TABLE IF NOT EXISTS settlement_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id),
  settlement_id uuid NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES daily_collections(id) ON DELETE CASCADE,
  allocated_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE settlement_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all (dev)" ON settlement_allocations FOR ALL USING (true) WITH CHECK (true);

-- =========================================
-- EXPENSE PAYMENTS
-- =========================================

CREATE TABLE IF NOT EXISTS expense_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'default_user',
  worker_id UUID NOT NULL REFERENCES workers(id),
  expense_id uuid NOT NULL REFERENCES weekly_expenses(id) ON DELETE CASCADE,
  payment_date date NOT NULL DEFAULT current_date,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE expense_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all (dev)" ON expense_payments FOR ALL USING (true) WITH CHECK (true);

-- =========================================
-- PAYMENT EVENTS (AUDIT TRAIL)
-- =========================================

CREATE TABLE IF NOT EXISTS payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'default_user',
  worker_id UUID NOT NULL REFERENCES workers(id),
  entity_type entity_type NOT NULL,
  entity_id uuid NOT NULL,
  event_type event_type NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  event_date date NOT NULL DEFAULT current_date,
  reference_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all (dev)" ON payment_events FOR ALL USING (true) WITH CHECK (true);

-- =========================================
-- INDEXES
-- =========================================

CREATE INDEX IF NOT EXISTS idx_daily_collections_worker_date ON daily_collections(worker_id, date);
CREATE INDEX IF NOT EXISTS idx_settlements_worker_date ON settlements(worker_id, settlement_date);
CREATE INDEX IF NOT EXISTS idx_payment_events_entity ON payment_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_worker ON payment_events(worker_id);
