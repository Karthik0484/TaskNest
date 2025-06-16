
-- 1. Create the files table
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,  -- "PDF", "Image", "Document", "Other"
  size TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  added_at DATE NOT NULL DEFAULT CURRENT_DATE,
  url TEXT NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: Allow users to access only their own files
CREATE POLICY "Users can access their own files" ON public.files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files" ON public.files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" ON public.files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" ON public.files
  FOR DELETE USING (auth.uid() = user_id);
