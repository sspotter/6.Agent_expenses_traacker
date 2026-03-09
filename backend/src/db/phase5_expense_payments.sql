-- Phase 5: Expense Payments & Model Refinement
-- Run this in your Supabase SQL Editor

-- Create the Expense Payments table
CREATE TABLE expense_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL DEFAULT 'default_user',
  expense_id uuid REFERENCES weekly_expenses(id) ON DELETE CASCADE,
  payment_date date NOT NULL DEFAULT current_date,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE expense_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for now" ON expense_payments
FOR ALL USING (true) WITH CHECK (true);

-- Ensure weekly_expenses has user_id and week_start_date is handled correctly
-- (The existing table should be fine based on previous steps)
