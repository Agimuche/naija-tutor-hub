
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS created_by uuid;

DROP POLICY IF EXISTS "Topics: admin write" ON public.topics;
DROP POLICY IF EXISTS "Topics: read all auth" ON public.topics;
DROP POLICY IF EXISTS "Questions: admin write" ON public.questions;
DROP POLICY IF EXISTS "Questions: read all auth" ON public.questions;

CREATE POLICY "Topics: read published" ON public.topics FOR SELECT TO authenticated
  USING (published = true OR created_by = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'teacher'));

CREATE POLICY "Topics: teacher/admin insert" ON public.topics FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Topics: teacher/admin update" ON public.topics FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Topics: teacher/admin delete" ON public.topics FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Questions: read auth" ON public.questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Questions: teacher/admin insert" ON public.questions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Questions: teacher/admin update" ON public.questions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Questions: teacher/admin delete" ON public.questions FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'teacher') OR has_role(auth.uid(),'admin'));

CREATE POLICY "Roles: self insert non-admin" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role IN ('user','teacher'));
