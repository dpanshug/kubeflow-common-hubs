-- Unique constraint: one submission per user per CFP
CREATE UNIQUE INDEX cfp_submissions_user_cfp_unique_idx ON public.cfp_submissions (cfp_id, user_id);

-- Admin/mod can read all submissions
CREATE POLICY "Admins can read submissions"
  ON public.cfp_submissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'moderator')));

-- Admin/mod can update submissions (status changes, feedback)
CREATE POLICY "Admins can update submissions"
  ON public.cfp_submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'moderator')));

-- Speakers can update their own submissions (for draft editing, before finalization)
CREATE POLICY "Users can update own submissions"
  ON public.cfp_submissions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
