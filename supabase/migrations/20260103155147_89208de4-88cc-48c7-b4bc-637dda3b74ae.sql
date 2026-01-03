-- Add new columns to employees table for better management
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS personal_email text,
ADD COLUMN IF NOT EXISTS temp_password text,
ADD COLUMN IF NOT EXISTS password_changed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS password_reset_required boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS added_by uuid;

-- Create a new table for employee tasks (since current tasks table only links to interns)
-- Modify tasks table to support both interns and employees
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS assigned_to_type text NOT NULL DEFAULT 'intern',
ADD COLUMN IF NOT EXISTS assigned_to_employee uuid REFERENCES public.employees(id) ON DELETE CASCADE;

-- Add check constraint for assigned_to_type
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_type_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_assigned_to_type_check 
CHECK (assigned_to_type IN ('intern', 'employee'));

-- Update RLS policy for employees to allow employees to view their own tasks
CREATE POLICY "Employees can view their own tasks" 
ON public.tasks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = tasks.assigned_to_employee 
    AND employees.user_id = auth.uid()
  )
);

CREATE POLICY "Employees can update their own task status" 
ON public.tasks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = tasks.assigned_to_employee 
    AND employees.user_id = auth.uid()
  )
);