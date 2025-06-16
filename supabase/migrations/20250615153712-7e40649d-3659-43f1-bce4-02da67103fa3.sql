
-- Create a table to store calendar events or tasks
CREATE TABLE public.calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on the calendar table
ALTER TABLE public.calendar ENABLE ROW LEVEL SECURITY;

-- Allow users to select (read) only their own calendar events
CREATE POLICY "Users can view their own calendar events"
  ON public.calendar
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert (add) their own calendar events
CREATE POLICY "Users can create their own calendar events"
  ON public.calendar
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own calendar events
CREATE POLICY "Users can update their own calendar events"
  ON public.calendar
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own calendar events
CREATE POLICY "Users can delete their own calendar events"
  ON public.calendar
  FOR DELETE
  USING (auth.uid() = user_id);
