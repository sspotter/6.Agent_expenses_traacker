-- ============================================================
-- Migration 006: Monthly Surplus Table
-- Purpose: Track surplus (over-collections) per worker per month
-- ============================================================

-- Create the monthly_surplus table
CREATE TABLE IF NOT EXISTS public.monthly_surplus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    amount_total NUMERIC NOT NULL DEFAULT 0,
    amount_unallocated NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one record per worker per month/year
    CONSTRAINT monthly_surplus_worker_month_year_key UNIQUE (worker_id, month, year)
);

-- Enable RLS
ALTER TABLE public.monthly_surplus ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all for now (adjust for production)
CREATE POLICY "Enable all access for monthly_surplus" ON public.monthly_surplus
FOR ALL USING (true) WITH CHECK (true);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_monthly_surplus_worker_month_year
ON public.monthly_surplus (worker_id, year, month);

-- Add comments
COMMENT ON TABLE public.monthly_surplus IS 'Tracks surplus (over-collections) per worker per month. Surplus = collected - expected when collected > expected.';
COMMENT ON COLUMN public.monthly_surplus.amount_total IS 'Total surplus generated in the month';
COMMENT ON COLUMN public.monthly_surplus.amount_unallocated IS 'Remaining surplus not yet used in settlements';
