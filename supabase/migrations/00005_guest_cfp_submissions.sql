-- Allow guest (non-authenticated) CFP submissions

-- Make user_id nullable so guest submissions don't require a user account
ALTER TABLE public.cfp_submissions ALTER COLUMN user_id DROP NOT NULL;

-- Add guest speaker fields
ALTER TABLE public.cfp_submissions ADD COLUMN guest_name text;
ALTER TABLE public.cfp_submissions ADD COLUMN guest_email text;

-- Drop the old unique index that assumes user_id is always present
DROP INDEX IF EXISTS cfp_submissions_user_cfp_unique_idx;

-- Recreate as a partial unique index for authenticated submissions only
CREATE UNIQUE INDEX cfp_submissions_user_cfp_unique_idx
  ON public.cfp_submissions (cfp_id, user_id)
  WHERE user_id IS NOT NULL;

-- Partial unique index for guest submissions (one per email per CFP)
CREATE UNIQUE INDEX cfp_submissions_guest_cfp_unique_idx
  ON public.cfp_submissions (cfp_id, guest_email)
  WHERE guest_email IS NOT NULL;

-- Allow anonymous inserts for guest submissions
CREATE POLICY "Guests can insert submissions"
  ON public.cfp_submissions FOR INSERT TO anon
  WITH CHECK (user_id IS NULL AND guest_name IS NOT NULL AND guest_email IS NOT NULL);

-- Allow service role full access (used by server actions)
CREATE POLICY "Service role full access on submissions"
  ON public.cfp_submissions FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
