# Kubeflow Common Hubs — Architecture

## Overview

A community platform for the Kubeflow ecosystem in India, built with Next.js 16 (App Router), Supabase, and deployed on Vercel.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel (Edge + Serverless)               │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │Middleware │→ │ App Router   │→ │ Server Actions / API      │  │
│  │(rate limit│  │ (RSC + Client│  │ Routes                    │  │
│  │ + auth)   │  │  Components) │  │                           │  │
│  └──────────┘  └──────────────┘  └────────────┬─────────────┘  │
└────────────────────────────────────────────────┼────────────────┘
                                                 │
         ┌───────────────┬───────────────────────┼──────────┐
         ▼               ▼                       ▼          ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐
│  Supabase    │ │ Upstash Redis│ │ Cloudflare R2│ │ GitHub API │
│  (Auth + PG  │ │ (Rate Limit) │ │ (Avatars)    │ │ (GraphQL)  │
│  + Realtime) │ │              │ │              │ │            │
└──────────────┘ └──────────────┘ └──────────────┘ └────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2, React 19, TypeScript |
| Styling | Tailwind CSS v4 (CSS variables), class-variance-authority |
| Database | PostgreSQL (Supabase-hosted), Drizzle ORM |
| Auth | Supabase Auth (Google, GitHub, Email/Password) |
| Realtime | Supabase Realtime (notifications) |
| Rate Limiting | Upstash Redis + @upstash/ratelimit |
| Object Storage | Cloudflare R2 (optional, S3-compatible) |
| Data Fetching | TanStack React Query v5 (client), Server Components (server) |
| Forms | React Hook Form + Zod validation |
| Icons | Lucide React |
| Animations | Motion library |
| Deployment | Vercel (Edge + Serverless) |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Marketing + directory pages (header/footer)
│   │   ├── page.tsx        # Landing page (/)
│   │   ├── events/         # /events
│   │   ├── news/           # /news
│   │   ├── cfps/           # /cfps
│   │   ├── badges/         # /badges
│   │   ├── leaderboard/    # /leaderboard
│   │   ├── members/        # /members, /members/[username]
│   │   └── about/          # /about
│   ├── (dashboard)/        # Authenticated pages
│   │   ├── profile/        # /profile, /profile/edit
│   │   ├── settings/       # /settings
│   │   └── notifications/  # /notifications
│   ├── (auth)/             # Auth flows (centered layout)
│   │   ├── login/          # /login
│   │   ├── signup/         # /signup
│   │   ├── onboarding/     # /onboarding (3-step wizard)
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── suspended/
│   │   └── auth/           # /auth/callback, /auth/confirm (route handlers)
│   ├── api/
│   │   ├── upload/avatar/  # Presigned R2 upload URL
│   │   └── cron/github-sync/ # Scheduled GitHub contribution sync
│   ├── layout.tsx          # Root layout (fonts, providers, metadata)
│   ├── globals.css         # Tailwind v4 theme + design tokens
│   └── not-found.tsx       # Global 404
├── components/
│   ├── layout/             # Header, Footer
│   ├── ui/                 # Button, Card, Badge (shadcn-style)
│   ├── landing/            # Hero, sections, particle field
│   ├── profile/            # Heatmap, level ring, tabs, timeline
│   ├── notifications/      # NotificationBell
│   ├── common/             # Shared utilities
│   └── providers.tsx       # ThemeProvider + QueryClientProvider
├── lib/
│   ├── supabase/           # client.ts, server.ts, middleware.ts, admin.ts
│   ├── auth/               # actions.ts (server actions), guards.ts
│   ├── profile/            # actions.ts (profile CRUD, GitHub sync trigger)
│   ├── settings/           # actions.ts (email prefs, password, OAuth linking)
│   ├── notifications/      # actions.ts (CRUD for notifications)
│   ├── github/             # sync.ts (GraphQL contribution fetching)
│   ├── r2/                 # client.ts (presigned URLs, validation)
│   ├── validations/        # auth.ts, profile.ts (Zod schemas)
│   ├── constants.ts        # Nav items, site config
│   └── utils.ts            # cn() helper
├── db/
│   ├── schema.ts           # Drizzle schema (14 tables, 12 enums)
│   ├── relations.ts        # Drizzle relation definitions
│   ├── index.ts            # DB client instance
│   └── seed.ts             # Seed script
├── hooks/
│   ├── use-auth.ts         # Client-side auth state
│   └── use-notifications.ts # Realtime notifications
└── middleware.ts           # Edge: rate limiting + session + route guards
```

---

## Database Schema

### Tables (14)

```
users ──────────── 1:1 ──── profiles
  │                            │
  ├── 1:N ── notifications     ├── contribution_calendar (JSONB)
  ├── 1:N ── activity_log      └── email_preferences (JSONB)
  ├── 1:N ── user_badges ──── N:1 ── badges
  ├── 1:N ── github_contributions
  ├── 1:N ── cfp_submissions ── N:1 ── cfps
  │               └── 1:N ── cfp_reviews
  ├── 1:N ── event_attendees ── N:1 ── events
  ├── 1:N ── news_posts
  └── 1:N ── audit_log
```

### Key Enums

- `user_role`: member | moderator | admin | superadmin
- `badge_tier`: bronze | silver | gold | platinum
- `cfp_submission_status`: submitted | in_review | shortlisted | approved | rejected | waitlisted
- `event_type`: meetup | conference | workshop | hackathon | webinar
- `notification_type`: badge_earned | cfp_status_changed | event_reminder | level_up | welcome | general

---

## Authentication Flow

```
Browser                    Middleware (Edge)              Supabase Auth
  │                              │                            │
  ├── GET /login ───────────────►│ (public route, pass)       │
  │                              │                            │
  ├── signInWithOAuth ──────────────────────────────────────►│
  │◄── redirect to Google/GitHub ────────────────────────────┤
  │                              │                            │
  ├── GET /auth/callback?code=.. │                            │
  │   └── exchangeCodeForSession ────────────────────────────►│
  │◄── redirect to /onboarding   │                            │
  │                              │                            │
  ├── GET /settings ────────────►│                            │
  │                              ├── updateSession (refresh)  │
  │                              ├── check JWT claims:        │
  │                              │   is_suspended? → /suspended
  │                              │   !onboarding? → /onboarding
  │                              │   !user? → /login          │
  │                              ├── rate limit (Upstash)     │
  │◄── 200 (render page) ───────┤                            │
```

### JWT Custom Claims Hook

A Postgres function (`custom_access_token_hook`) injects `is_suspended` and `onboarding_completed` into the JWT, allowing the middleware to enforce these checks without DB queries.

### Row-Level Security

RLS policies on all 14 tables enforce:
- Users read/update own data
- Admins/moderators manage events, CFPs, badges, news
- Service role handles automated writes (badge awards, GitHub sync)

---

## API Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/upload/avatar` | Generate presigned R2 upload URL (requires auth, gracefully 503s if R2 unconfigured) |
| GET | `/api/cron/github-sync` | Batch GitHub contribution sync (protected by CRON_SECRET bearer token) |

### Route Handlers (Auth)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/auth/callback` | OAuth code exchange (PKCE) |
| GET | `/auth/confirm` | Email verification OTP |

---

## External Services

### Supabase
- **Auth**: OAuth (Google, GitHub), email/password, magic links
- **Database**: PostgreSQL with connection pooling (port 6543) and direct connection (port 5432)
- **Realtime**: WebSocket subscriptions for `notifications` table changes

### Upstash Redis
- Sliding-window rate limiter in Edge Middleware
- Strict limits on auth endpoints (5 req/60s)
- Standard limits on API routes (20 req/10s)
- Gracefully disabled if env vars are missing

### Cloudflare R2
- S3-compatible object storage for avatar uploads
- Presigned PUT URLs (5 min expiry, max 5MB, JPEG/PNG/WebP)
- Gracefully disabled if env vars are missing

### GitHub API
- GraphQL endpoint for contribution calendar + repository stats
- Filters for Kubeflow org repositories
- Batched sync via cron (10 users per run)
- Personal Access Token with `read:user` + `read:org` scopes

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Admin operations (bypasses RLS) |
| `DATABASE_URL` | Yes | Pooled PostgreSQL connection (Drizzle) |
| `DIRECT_URL` | Yes | Direct PostgreSQL connection (migrations) |
| `NEXT_PUBLIC_SITE_URL` | Yes | App URL (localhost dev, vercel.app prod) |
| `CRON_SECRET` | Yes | Protects cron API routes |
| `UPSTASH_REDIS_REST_URL` | Optional | Enables rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Enables rate limiting |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | Optional | Enables GitHub contribution sync |
| `R2_ACCOUNT_ID` | Optional | Enables avatar uploads |
| `R2_ACCESS_KEY_ID` | Optional | Enables avatar uploads |
| `R2_SECRET_ACCESS_KEY` | Optional | Enables avatar uploads |
| `R2_BUCKET_NAME` | Optional | Enables avatar uploads |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Optional | Public avatar URL base |

---

## Deployment

- **Platform**: Vercel
- **Build**: `next build` (Turbopack in dev)
- **CI**: GitHub Actions — ESLint + TypeScript check + production build on every PR
- **Edge Functions**: Middleware runs at edge for rate limiting + auth
- **Serverless**: API routes + Server Actions run as serverless functions
- **Cron**: GitHub sync triggered via Vercel Cron or external scheduler hitting `/api/cron/github-sync`

### Production URLs
- App: `https://kubeflow-common-hubs.vercel.app`
- Supabase callback: `https://fbtydnumdgporqkelnxz.supabase.co/auth/v1/callback`

---

## Security

- PKCE flow for OAuth (no client secrets exposed to browser)
- Row-Level Security on all tables
- Rate limiting on auth endpoints
- Open redirect prevention (`next` param validated)
- Service role key never exposed to client
- JWT claims for middleware checks (no extra DB roundtrips)
- Soft-delete for account deletion (grace period recovery)
