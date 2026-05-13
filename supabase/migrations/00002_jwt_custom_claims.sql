-- Custom access token hook: injects is_suspended and onboarding_completed
-- into the JWT so middleware can check them without a DB query.
-- Enable in Supabase Dashboard: Authentication > Hooks > Custom Access Token
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_suspended boolean;
  onboarding_done boolean;
BEGIN
  SELECT is_suspended INTO user_suspended
    FROM public.users WHERE id = (event->>'user_id')::uuid;
  SELECT onboarding_completed INTO onboarding_done
    FROM public.profiles WHERE user_id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(claims, '{is_suspended}', to_jsonb(COALESCE(user_suspended, false)));
  claims := jsonb_set(claims, '{onboarding_completed}', to_jsonb(COALESCE(onboarding_done, false)));

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions for the hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.users TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
