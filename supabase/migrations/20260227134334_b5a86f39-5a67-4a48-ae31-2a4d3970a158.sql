
-- Create intern daily progress table
CREATE TABLE public.intern_daily_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intern_id UUID NOT NULL REFERENCES public.interns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  progress_date DATE NOT NULL DEFAULT CURRENT_DATE,
  section_worked TEXT NOT NULL,
  work_done TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intern_daily_progress ENABLE ROW LEVEL SECURITY;

-- Interns can view their own progress
CREATE POLICY "Interns can view own progress"
ON public.intern_daily_progress FOR SELECT
USING (user_id = auth.uid());

-- Interns can insert their own progress
CREATE POLICY "Interns can insert own progress"
ON public.intern_daily_progress FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Interns can update their own progress
CREATE POLICY "Interns can update own progress"
ON public.intern_daily_progress FOR UPDATE
USING (user_id = auth.uid());

-- Interns can delete their own progress
CREATE POLICY "Interns can delete own progress"
ON public.intern_daily_progress FOR DELETE
USING (user_id = auth.uid());

-- Admins can view all progress
CREATE POLICY "Admins can view all progress"
ON public.intern_daily_progress FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Employees can view progress of their interns
CREATE POLICY "Employees can view intern progress"
ON public.intern_daily_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM interns
    WHERE interns.id = intern_daily_progress.intern_id
    AND interns.added_by = auth.uid()
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_intern_daily_progress_updated_at
BEFORE UPDATE ON public.intern_daily_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint for one entry per intern per date
ALTER TABLE public.intern_daily_progress
ADD CONSTRAINT unique_intern_daily_progress UNIQUE (intern_id, progress_date);
