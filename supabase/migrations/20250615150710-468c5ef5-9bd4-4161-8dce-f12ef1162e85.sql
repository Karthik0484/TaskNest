
-- 1. Create a "tasks" table with a user_id foreign key referencing auth.users
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL,
  tags text[] DEFAULT '{}',
  deadline date,
  created_at date NOT NULL DEFAULT CURRENT_DATE,
  completed_at date
);

-- 2. Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 3. POLICY: Users can READ their own tasks
CREATE POLICY "Users can read their own tasks"
  ON public.tasks
  FOR SELECT
  USING (user_id = auth.uid());

-- 4. POLICY: Users can CREATE their own tasks
CREATE POLICY "Users can create their own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 5. POLICY: Users can UPDATE their own tasks
CREATE POLICY "Users can update their own tasks"
  ON public.tasks
  FOR UPDATE
  USING (user_id = auth.uid());

-- 6. POLICY: Users can DELETE their own tasks
CREATE POLICY "Users can delete their own tasks"
  ON public.tasks
  FOR DELETE
  USING (user_id = auth.uid());
