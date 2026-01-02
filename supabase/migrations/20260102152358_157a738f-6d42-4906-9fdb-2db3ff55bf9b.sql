-- Drop dependent policies first
DROP POLICY IF EXISTS "Admins can manage job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Admins can view job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can update job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can manage internship programs" ON public.internship_programs;
DROP POLICY IF EXISTS "Admins can view internship enquiries" ON public.internship_enquiries;
DROP POLICY IF EXISTS "Admins can update internship enquiries" ON public.internship_enquiries;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view resumes" ON storage.objects;

-- Drop the function
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Update user_roles table to use text temporarily
ALTER TABLE public.user_roles ALTER COLUMN role TYPE text;

-- Drop old enum
DROP TYPE public.app_role;

-- Create new enum with employee and intern
CREATE TYPE public.app_role AS ENUM ('admin', 'employee', 'intern');

-- Convert column back to enum
ALTER TABLE public.user_roles ALTER COLUMN role TYPE app_role USING role::app_role;

-- Recreate the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Recreate all the dropped policies
CREATE POLICY "Admins can manage job postings" ON public.job_postings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view job applications" ON public.job_applications
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update job applications" ON public.job_applications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage internship programs" ON public.internship_programs
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view internship enquiries" ON public.internship_enquiries
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update internship enquiries" ON public.internship_enquiries
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view user roles" ON public.user_roles
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes' AND has_role(auth.uid(), 'admin'));

-- Create employees table
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  department text NOT NULL,
  position text NOT NULL,
  phone text,
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create interns table with onboarding flow
CREATE TABLE public.interns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
  full_name text NOT NULL,
  personal_email text NOT NULL,
  company_email text,
  phone text NOT NULL,
  domain text NOT NULL,
  duration text NOT NULL,
  start_date date,
  end_date date,
  college_name text,
  course text,
  added_by uuid REFERENCES auth.users(id) NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'active', 'completed')),
  temp_password text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES public.interns(id) ON DELETE CASCADE NOT NULL,
  assigned_by uuid REFERENCES auth.users(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date date,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create notifications table for approval requests
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'approval_request', 'approval_result', 'task_assigned')),
  related_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Employees policies
CREATE POLICY "Admins can manage employees" ON public.employees
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view themselves" ON public.employees
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Employees can view all employees" ON public.employees
  FOR SELECT USING (has_role(auth.uid(), 'employee'));

-- Interns policies
CREATE POLICY "Admins can manage all interns" ON public.interns
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view interns" ON public.interns
  FOR SELECT USING (has_role(auth.uid(), 'employee'));

CREATE POLICY "Employees can insert interns" ON public.interns
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'employee') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can update interns they added" ON public.interns
  FOR UPDATE USING (added_by = auth.uid() AND has_role(auth.uid(), 'employee'));

CREATE POLICY "Interns can view themselves" ON public.interns
  FOR SELECT USING (user_id = auth.uid());

-- Tasks policies
CREATE POLICY "Admins can manage all tasks" ON public.tasks
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can manage tasks" ON public.tasks
  FOR ALL USING (has_role(auth.uid(), 'employee'));

CREATE POLICY "Interns can view their tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.interns 
      WHERE interns.id = tasks.assigned_to 
      AND interns.user_id = auth.uid()
    )
  );

CREATE POLICY "Interns can update their task status" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.interns 
      WHERE interns.id = tasks.assigned_to 
      AND interns.user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'employee'));

-- Add triggers for updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interns_updated_at
  BEFORE UPDATE ON public.interns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();