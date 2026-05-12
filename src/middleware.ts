import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_ROUTES = ["/profile/edit", "/settings", "/notifications"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const AUTH_STRICT_ROUTES = ["/login", "/signup", "/forgot-password"];
const ONBOARDING_ROUTE = "/onboarding";
const SUSPENDED_ROUTE = "/suspended";

let _redis: Redis | null | undefined;
function getRedisClient() {
  if (_redis !== undefined) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    _redis = null;
    return _redis;
  }
  try {
    _redis = new Redis({ url, token });
  } catch {
    _redis = null;
  }
  return _redis;
}

let _limiters: { auth: Ratelimit; standard: Ratelimit } | undefined;
function createRateLimiters(redis: Redis) {
  if (_limiters) return _limiters;
  _limiters = {
    auth: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "rl:auth",
    }),
    standard: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "rl:std",
    }),
  };
  return _limiters;
}

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthStrictRoute(pathname: string) {
  return AUTH_STRICT_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting (only if Redis is configured)
  const redis = getRedisClient();
  if (redis) {
    try {
      const limiters = createRateLimiters(redis);
      const identifier =
        (request as unknown as { ip?: string }).ip ||
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "127.0.0.1";

      const limiter = isAuthStrictRoute(pathname) ? limiters.auth : limiters.standard;
      const { success, limit, remaining, reset } = await limiter.limit(identifier);

      if (!success) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        });
      }
    } catch {
      // Rate limiting failed (Redis unavailable) — allow request through
    }
  }

  // Refresh Supabase session
  const { user, response } = await updateSession(request);

  // Already authenticated users visiting auth pages -> redirect away
  if (user && isAuthRoute(pathname) && pathname !== ONBOARDING_ROUTE) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // Protected routes require authentication
  if (isProtectedRoute(pathname)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check JWT custom claims for suspension (only if claim exists)
    const isSuspended = user.app_metadata?.is_suspended;
    if (isSuspended === true && pathname !== SUSPENDED_ROUTE) {
      const suspendedUrl = request.nextUrl.clone();
      suspendedUrl.pathname = SUSPENDED_ROUTE;
      suspendedUrl.search = "";
      return NextResponse.redirect(suspendedUrl);
    }

    // Check onboarding completion from JWT claims
    // Only enforce if the claim is explicitly set to false (requires JWT hook)
    const onboardingCompleted = user.app_metadata?.onboarding_completed;
    if (onboardingCompleted === false && pathname !== ONBOARDING_ROUTE) {
      const onboardingUrl = request.nextUrl.clone();
      onboardingUrl.pathname = ONBOARDING_ROUTE;
      onboardingUrl.search = "";
      return NextResponse.redirect(onboardingUrl);
    }
  }

  // Onboarding route requires auth but not protected-route level checks
  if (pathname === ONBOARDING_ROUTE && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", ONBOARDING_ROUTE);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
