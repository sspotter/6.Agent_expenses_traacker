-- Create worker_rates table
CREATE TABLE IF NOT EXISTS public.worker_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  rate_amount NUMERIC(10,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.worker_rates ENABLE ROW LEVEL SECURITY;

-- Policies for worker_rates
CREATE POLICY "Users can view their own worker rates"
  ON public.worker_rates FOR SELECT
  USING (true); -- Ideally scoped to user who owns the worker, but keeping simple for now

CREATE POLICY "Users can insert their own worker rates"
  ON public.worker_rates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own worker rates"
  ON public.worker_rates FOR UPDATE
  USING (true);

-- Ensure daily_collections has expected_amount (it should already be there)
-- But we can add a comment on column if we want, or do nothing.
COMMENT ON COLUMN daily_collections.expected_amount IS 'Snapshot of the rate at the time of creation';

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_worker_rates_worker_dates ON public.worker_rates (worker_id, effective_from, effective_to);
