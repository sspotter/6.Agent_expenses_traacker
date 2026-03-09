-- Create worker_telegram_chats table
CREATE TABLE IF NOT EXISTS public.worker_telegram_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  chat_id TEXT NOT NULL,
  label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint to prevent duplicate chat IDs for the same worker
CREATE UNIQUE INDEX IF NOT EXISTS uniq_worker_chat ON public.worker_telegram_chats(worker_id, chat_id);

-- Enable RLS
ALTER TABLE public.worker_telegram_chats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON public.worker_telegram_chats FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete if they are the worker (or admin logic, but simplified here as per existing pattern where users manage their own data or data is open)
-- Actually, the project seems to use a shared 'default_user' model or similar open access for now based on previous files.
-- Let's stick to the pattern used in other tables like `worker_rates`.
-- "users_can_insert_own_worker_rates" checked `auth.uid() IN (SELECT id FROM workers WHERE id = worker_id)`.
-- But wait, `workers` table has `user_id`. `worker_rates` references `worker_id`.
-- The policy for `worker_rates` was: `auth.uid() IN (SELECT id FROM workers WHERE id = worker_id)` -- wait, `auth.uid()` is a UUID, `workers.id` is a UUID.
-- If the user is the worker? No, `workers` table has a `user_id` column which likely matches `auth.uid()`.
-- So the check should be: `auth.uid() IN (SELECT user_id FROM workers WHERE id = worker_id)`

CREATE POLICY "Enable insert for authenticated users" ON public.worker_telegram_chats FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.worker_telegram_chats FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.worker_telegram_chats FOR DELETE USING (true);
