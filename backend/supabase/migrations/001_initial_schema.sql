-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Daily Collections Table
create table public.daily_collections (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  date date not null,
  expected_amount numeric not null default 0,
  collected_amount numeric not null default 0,
  status text check (status in ('FULL', 'PARTIAL', 'MISSED')) not null default 'MISSED',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint daily_collections_user_date_key unique (user_id, date),
  constraint collected_le_expected check (collected_amount <= expected_amount)
);

-- Weekly Expenses Table
create table public.weekly_expenses (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  week_start_date date not null,
  week_end_date date not null,
  amount numeric not null default 0,
  category text not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Settlements Table
create table public.settlements (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  settlement_date date not null default current_date,
  amount numeric not null,
  applied_to_month date not null, -- Storing the first day of the month being settled
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.daily_collections enable row level security;
alter table public.weekly_expenses enable row level security;
alter table public.settlements enable row level security;

-- Policies for daily_collections
create policy "Users can view their own daily collections"
  on public.daily_collections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own daily collections"
  on public.daily_collections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own daily collections"
  on public.daily_collections for update
  using (auth.uid() = user_id);

create policy "Users can delete their own daily collections"
  on public.daily_collections for delete
  using (auth.uid() = user_id);

-- Policies for weekly_expenses
create policy "Users can view their own weekly expenses"
  on public.weekly_expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own weekly expenses"
  on public.weekly_expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own weekly expenses"
  on public.weekly_expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own weekly expenses"
  on public.weekly_expenses for delete
  using (auth.uid() = user_id);

-- Policies for settlements
create policy "Users can view their own settlements"
  on public.settlements for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settlements"
  on public.settlements for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settlements"
  on public.settlements for update
  using (auth.uid() = user_id);

create policy "Users can delete their own settlements"
  on public.settlements for delete
  using (auth.uid() = user_id);

-- Create indexes for performance
create index daily_collections_date_idx on public.daily_collections (date);
create index settlements_applied_to_month_idx on public.settlements (applied_to_month);
