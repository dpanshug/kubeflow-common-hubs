-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cfp_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cfp_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users: anyone authenticated can read, only own row can be updated
CREATE POLICY "Users are viewable by authenticated users"
  ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Profiles: anyone authenticated can read, only own row can be updated
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Events: anyone can read, admin/mod can CUD
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'moderator')));

-- Event attendees: users can manage their own attendance
CREATE POLICY "Attendees viewable by authenticated"
  ON public.event_attendees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own attendance"
  ON public.event_attendees FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CFPs: anyone can read open, admins can manage
CREATE POLICY "Open CFPs are viewable"
  ON public.cfps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage CFPs"
  ON public.cfps FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'moderator')));

-- CFP submissions: users can read own, admins can read all
CREATE POLICY "Users can view own submissions"
  ON public.cfp_submissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'moderator')));
CREATE POLICY "Users can create submissions"
  ON public.cfp_submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- CFP reviews: admins/mods only
CREATE POLICY "Reviewers can manage reviews"
  ON public.cfp_reviews FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'moderator')));

-- Badges: everyone can read
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage badges"
  ON public.badges FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- User badges: everyone can read, service role inserts
CREATE POLICY "User badges are viewable"
  ON public.user_badges FOR SELECT TO authenticated USING (true);

-- GitHub contributions: everyone can read own, service role writes
CREATE POLICY "Contributions are viewable"
  ON public.github_contributions FOR SELECT TO authenticated USING (true);

-- News: everyone can read published
CREATE POLICY "Published news viewable"
  ON public.news_posts FOR SELECT TO authenticated
  USING (status = 'published' OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'moderator')));
CREATE POLICY "Admins can manage news"
  ON public.news_posts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'moderator')));

-- Activity log: users can read own, admins can read all
CREATE POLICY "Users can view own activity"
  ON public.activity_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- Audit log: admins only
CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));

-- Notifications: users can read/update own only
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
