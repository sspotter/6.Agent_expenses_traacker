-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- 1. Daily Collections
create table daily_collections (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default 'default_user', -- For now, we default to a single user or handle in frontend
  date date not null,
  expected_amount numeric not null default 0,
  collected_amount numeric not null default 0,
  status text check (status in ('FULL', 'PARTIAL', 'MISSED')) not null default 'MISSED',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraint: One record per day per user
  unique(user_id, date)
);

alter table daily_collections enable row level security;

create policy "Enable all access for now" on daily_collections
for all using (true) with check (true);


-- 2. Weekly Expenses
create table weekly_expenses (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default 'default_user',
  week_start_date date not null,
  week_end_date date, -- Optional
  amount numeric not null default 0,
  category text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table weekly_expenses enable row level security;

create policy "Enable all access for now" on weekly_expenses
for all using (true) with check (true);


-- 3. Settlements
create table settlements (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default 'default_user',
  settlement_date date not null default current_date,
  amount numeric not null default 0,
  applied_to_month text, -- Format: YYYY-MM
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table settlements enable row level security;
create policy "Enable all access for now" on settlements for all using (true) with check (true);


-- 4. Settlement Allocations (Links settlements to specific daily gaps)
create table settlement_allocations (
  id uuid default gen_random_uuid() primary key,
  settlement_id uuid references settlements(id) on delete cascade,
  collection_id uuid references daily_collections(id) on delete cascade,
  allocated_amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table settlement_allocations enable row level security;
create policy "Enable all access for now" on settlement_allocations for all using (true) with check (true);


-- 5. Expense Payments (Tracking payments for specific obligations)
create table expense_payments (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default 'default_user',
  expense_id uuid references weekly_expenses(id) on delete cascade,
  amount numeric not null,
  payment_date date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table expense_payments enable row level security;
create policy "Enable all access for now" on expense_payments for all using (true) with check (true);


-- 6. Payment Events (The Audit Trail)
create table payment_events (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default 'default_user',
  entity_type text not null, -- 'DAILY_COLLECTION' or 'WEEKLY_EXPENSE'
  entity_id uuid not null,
  event_type text not null, -- 'COLLECTED', 'SETTLED', 'PAID', 'CREATED'
  amount numeric not null,
  event_date date not null,
  reference_id uuid, -- Link to settlement_id or expense_payment_id
  metadata jsonb default '{}'::jsonb, -- Notes, original category, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table payment_events enable row level security;
create policy "Enable all access for now" on payment_events for all using (true) with check (true);
