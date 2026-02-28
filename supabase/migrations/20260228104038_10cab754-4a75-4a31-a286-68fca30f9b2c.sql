
-- Fix infinite recursion in conversation_members policies
-- The SELECT policy references conversation_members itself, causing recursion

-- Drop the problematic policies
DROP POLICY IF EXISTS "Members can view conversation members" ON public.conversation_members;
DROP POLICY IF EXISTS "Admins and group admins can add members" ON public.conversation_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.conversation_members;

-- Create a security definer function to check membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = _conversation_id
    AND user_id = _user_id
  )
$$;

-- Create a security definer function to check if user is group admin
CREATE OR REPLACE FUNCTION public.is_conversation_admin(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = _conversation_id
    AND user_id = _user_id
    AND role = 'admin'
  )
$$;

-- Recreate policies using the security definer functions
CREATE POLICY "Members can view conversation members"
ON public.conversation_members FOR SELECT
USING (
  is_conversation_member(conversation_id, auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins and group admins can add members"
ON public.conversation_members FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR is_conversation_admin(conversation_id, auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Admins can remove members"
ON public.conversation_members FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR user_id = auth.uid()
  OR is_conversation_admin(conversation_id, auth.uid())
);

-- Also fix the conversations SELECT policy which references conversation_members
DROP POLICY IF EXISTS "Members can view their conversations" ON public.conversations;

CREATE POLICY "Members can view their conversations"
ON public.conversations FOR SELECT
USING (
  type = 'general'
  OR is_conversation_member(id, auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Fix messages SELECT policy which also references conversation_members
DROP POLICY IF EXISTS "Members can view messages in their conversations" ON public.messages;

CREATE POLICY "Members can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.type = 'general' OR is_conversation_member(c.id, auth.uid()))
  ))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Fix messages INSERT policy
DROP POLICY IF EXISTS "Members can send messages to their conversations" ON public.messages;

CREATE POLICY "Members can send messages to their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (
      c.type = 'general'
      OR (c.approval_status = 'approved' AND is_conversation_member(c.id, auth.uid()))
    )
  )
);
