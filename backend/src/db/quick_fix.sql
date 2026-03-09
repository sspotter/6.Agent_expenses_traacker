-- Quick Fix: Alter existing table to change user_id type
-- This preserves data if you have any

-- Step 1: Drop the unique constraint first
ALTER TABLE daily_collections DROP CONSTRAINT IF EXISTS daily_collections_user_id_date_key;

-- Step 2: Change user_id column type from uuid to text
ALTER TABLE daily_collections ALTER COLUMN user_id TYPE text USING user_id::text;

-- Step 3: Set default value
ALTER TABLE daily_collections ALTER COLUMN user_id SET DEFAULT 'default_user';

-- Step 4: Recreate the unique constraint
ALTER TABLE daily_collections ADD CONSTRAINT daily_collections_user_id_date_key UNIQUE (user_id, date);

-- Do the same for weekly_expenses
ALTER TABLE weekly_expenses ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE weekly_expenses ALTER COLUMN user_id SET DEFAULT 'default_user';

-- Do the same for settlements
ALTER TABLE settlements ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE settlements ALTER COLUMN user_id SET DEFAULT 'default_user';

-- Done! Now test again at http://localhost:5173/test.html
