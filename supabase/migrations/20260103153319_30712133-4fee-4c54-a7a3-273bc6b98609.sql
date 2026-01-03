-- Add password_changed column to interns table to track if intern has changed their temp password
ALTER TABLE public.interns ADD COLUMN IF NOT EXISTS password_changed boolean NOT NULL DEFAULT false;

-- Add password_reset_required column to track when admin/employee resets password
ALTER TABLE public.interns ADD COLUMN IF NOT EXISTS password_reset_required boolean NOT NULL DEFAULT false;