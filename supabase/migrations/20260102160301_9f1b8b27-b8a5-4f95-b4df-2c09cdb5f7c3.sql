-- Update RLS policy for user_roles to allow authenticated users to insert their own role
-- This is needed because when admin creates an employee, signUp logs in as the new user

-- First drop the existing policy
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Create separate policies for each operation
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow authenticated users to insert their own role (needed for employee/intern creation flow)
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
WITH CHECK (user_id = auth.uid());