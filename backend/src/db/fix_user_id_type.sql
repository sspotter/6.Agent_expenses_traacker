-- Migration: Fix user_id type from uuid to text
-- Run this in your Supabase SQL Editor

-- Drop existing tables (this will delete all data!)
DROP TABLE IF EXISTS settlements;
DROP TABLE IF EXISTS weekly_expenses;
DROP TABLE IF EXISTS daily_collections;

-- Recreate with correct schema
-- 1. Daily Collections
CREATE TABLE daily_collections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL DEFAULT 'default_user',
  date date NOT NULL,
  expected_amount numeric NOT NULL DEFAULT 0,
  collected_amount numeric NOT NULL DEFAULT 0,
  status text CHECK (status IN ('FULL', 'PARTIAL', 'MISSED')) NOT NULL DEFAULT 'MISSED',
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(user_id, date)
);

ALTER TABLE daily_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for now" ON daily_collections
FOR ALL USING (true) WITH CHECK (true);


-- 2. Weekly Expenses
CREATE TABLE weekly_expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL DEFAULT 'default_user',
  week_start_date date NOT NULL,
  week_end_date date,
  amount numeric NOT NULL DEFAULT 0,
  category text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE weekly_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for now" ON weekly_expenses
FOR ALL USING (true) WITH CHECK (true);


-- 3. Settlements
CREATE TABLE settlements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL DEFAULT 'default_user',
  settlement_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL DEFAULT 0,
  applied_to_month text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for now" ON settlements
FOR ALL USING (true) WITH CHECK (true);
