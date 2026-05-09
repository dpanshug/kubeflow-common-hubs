# Kubeflow Common Hubs -- Project Progress

## Phase 1: Foundation + Design System + Public Site -- COMPLETE

### Scaffolding
- [x] Next.js 16 with TypeScript, Tailwind v4, App Router, Turbopack
- [x] Drizzle ORM with full database schema (13 tables, 11 enums, indexes, constraints)
- [x] `.env.example` with all service credentials documented
- [x] Apache 2.0 license, README, CONTRIBUTING.md

### Design System
- [x] Blue-tinted color tokens for dark and light themes
- [x] Typography scale (Inter headings/body, JetBrains Mono code/stats)
- [x] Motion tokens (ease curves, durations, keyframes)
- [x] Glass surface utilities, glow utilities
- [x] Dark/light theme toggle with `next-themes`
- [x] `color-scheme` for native form controls
- [x] Custom scrollbar (WebKit + Firefox)
- [x] Reduced motion support
- [x] Focus-visible rings, skip-to-content link

### Landing Page
- [x] Hero with interactive particle field (dots push away on cursor hover)
- [x] Hidden "KUBEFLOW" text revealed when cursor pushes particles away
- [x] Animated gradient orbs on deep navy-blue background
- [x] Live stat counters (animated count-up on scroll into view)
- [x] Activity ticker (auto-scrolling community feed, pause on hover)
- [x] Upcoming Events section with event cards
- [x] How It Works (3-step visual with numbered icons)
- [x] Featured Badges showcase with tier glow effects
- [x] Community Voices testimonial carousel (auto-rotate, manual nav)
- [x] CTA section with gradient glow background

### Public Pages
- [x] `/events` -- Event listing with type filters, date chips, attendee counts
- [x] `/news` -- News articles with tags, author, timestamps
- [x] `/cfps` -- Open CFPs with deadline countdowns, topic tags, submit CTAs
- [x] `/badges` -- Badge catalog with tier indicators, earn counts, category filters
- [x] `/leaderboard` -- Podium top 3, ranking table, trend arrows, Rising Stars
- [x] `/members` -- Member directory with search, avatars, level, badge counts
- [x] `/about` -- Community values, description, external links

### Layout
- [x] Header: transparent on hero, frosted dark glass on scroll, theme toggle
- [x] Footer: 4-column links, GitHub + X social icons, copyright
- [x] Mobile responsive: hamburger menu, stacked layouts

### CI/CD
- [x] CI workflow: ESLint + TypeScript check + Next.js build on every PR/push
- [x] Claude Code Review: AI-powered review with autofix on every PR
- [x] Claude Issue Assistant: auto-triage, labeling, analysis on issues (read-only)
- [x] Dependabot: weekly grouped dependency updates (npm + GitHub Actions)
- [x] `.next/cache` caching for faster CI builds
- [x] Placeholder env vars in CI build step

### Code Quality
- [x] 27 code review findings fixed (accessibility, performance, security)
- [x] Zero lint errors, zero type errors, clean production build
- [x] All 8 routes statically prerendered

---

## Deployment + Infrastructure -- IN PROGRESS

### Done
- [x] GitHub repo live at https://github.com/dpanshug/kubeflow-common-hubs
- [x] Branch protection on `main` (require PR, 1 approval, CI must pass, no force push)
- [x] CI/CD pipelines (CI, Claude Review, Claude Issues, Dependabot)

### Vercel (Hosting) -- TODO
- [ ] Connect Vercel to GitHub repo (vercel.com > Add New Project > select repo)
- [ ] Verify auto-deploy on push to `main`
- [ ] Verify preview deploys on PRs
- [ ] Apply to Vercel OSS Program (https://vercel.com/open-source-program) for $3,600 credits

### Domain -- TODO (when ready)
- [ ] Purchase domain (e.g., `kubeflowcommonhubs.in` or `kfhubs.dev`)
- [ ] Add custom domain in Vercel project settings
- [ ] Configure DNS (CNAME to `cname.vercel-dns.com`)

### Supabase (Auth + Database) -- TODO (Phase 2 prerequisite)
- [ ] Create Supabase project at https://supabase.com/dashboard
- [ ] Run database migrations (`npx drizzle-kit push`)
- [ ] Enable Google and GitHub OAuth providers in Supabase Auth settings
- [ ] Add Supabase env vars to Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`
- [ ] Set up Supabase CLI for local dev (`supabase init`, `supabase start`)

### Cloudflare R2 (File Storage) -- TODO (Phase 2 prerequisite)
- [ ] Create R2 bucket in Cloudflare dashboard
- [ ] Create API token with R2 read/write access
- [ ] Enable public access on the bucket (for serving badge images, avatars)
- [ ] Add R2 env vars to Vercel: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL`

### Upstash Redis (Rate Limiting) -- TODO (Phase 2 prerequisite)
- [ ] Create Upstash Redis database at https://upstash.com
- [ ] Add env vars to Vercel: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### Resend (Email) -- TODO (Phase 3 prerequisite)
- [ ] Create Resend account at https://resend.com
- [ ] Verify sending domain (once custom domain is set up)
- [ ] Add env var to Vercel: `RESEND_API_KEY`

### Sentry (Error Tracking) -- TODO (before launch)
- [ ] Create Sentry project at https://sentry.io
- [ ] Add env var to Vercel: `SENTRY_DSN`
- [ ] Install `@sentry/nextjs` and configure

---

## Phase 2: Auth + Profiles + GitHub Integration -- NOT STARTED

- [ ] Supabase project setup (local Docker + remote)
- [ ] Supabase Auth: Google, GitHub, email/password sign-in
- [ ] Auth middleware chain: rate limiter, auth check, RBAC, suspension check
- [ ] 3-step onboarding wizard (name/avatar, GitHub link, pick interests)
- [ ] User profile page (tabbed: overview, badges, contributions, CFPs, timeline)
- [ ] Profile edit with React Hook Form + Zod validation
- [ ] Avatar upload to Cloudflare R2 (presigned URLs, size/type validation)
- [ ] GitHub contribution sync via GraphQL API (batched, rate-limit handling)
- [ ] Contribution heatmap component (GitHub-style grid)
- [ ] Notification system: DB table + bell icon + Supabase Realtime
- [ ] Settings page (theme, email preferences, linked accounts)

---

## Phase 3: CFP System -- NOT STARTED

- [ ] Multi-step CFP submission wizard (4 steps with progress bar)
- [ ] CFP status tracker with visual pipeline
- [ ] My Submissions dashboard with filters
- [ ] Admin: CFP review interface with scoring, feedback, bulk actions
- [ ] `cfp_reviews` table: multiple reviewers per submission
- [ ] State machine enforcement in Server Actions (submitted -> in_review -> approved/rejected)
- [ ] Email notifications via Supabase Edge Function (submission received, status changed)
- [ ] Empty states with encouraging CTAs

---

## Phase 4: Badge System + Gamification -- NOT STARTED

- [ ] Admin: badge creation form (SVG upload to R2, criteria rule builder, tier, points)
- [ ] Badge engine: JSON rule evaluator against contribution data + activity log
- [ ] Automated badge awarding via Vercel Cron (daily, idempotent)
- [ ] Badge celebration animation (confetti + scale bounce)
- [ ] Badge shelf on profile (horizontal scroll, filter by category)
- [ ] Badge detail modal (description, criteria, evidence, earned date)
- [ ] Badge verification page: `/badges/verify/[id]` (Open Badges 3.0 JSON-LD)
- [ ] Social share card generation for badges
- [ ] Points system: Postgres function recalculates from source tables
- [ ] Levels with animated level-ring around avatar
- [ ] Leaderboard with working filter tabs and Rising Stars section

---

## Phase 5: Admin Panel -- NOT STARTED

- [ ] Admin layout with dark sidebar, collapsible sections, breadcrumbs
- [ ] Dashboard: metric cards (users, events, pending CFPs, badges) + charts
- [ ] User management: search, filter by role, view profile, change role, suspend
- [ ] Event management: CRUD, set featured, view attendees, check-in
- [ ] CFP management: create CFP, link to event, manage submissions pipeline
- [ ] Badge management: create/edit badges, view award history, manually award
- [ ] Content management: news posts with markdown editor, publish/unpublish/schedule
- [ ] Audit log viewer: filterable by actor, action type, date range

---

## Phase 6: Polish + Launch -- NOT STARTED

- [ ] Contributor journey timeline (vertical timeline on profile from activity_log)
- [ ] "What's Next" recommendation engine (suggest next badge, event, contribution)
- [ ] Community Showcase Wall (public page with live achievement feed)
- [ ] Data lifecycle cron jobs (notification cleanup 7/30 day, activity archival 6 months)
- [ ] Weekly email digest (Supabase Edge Function + Vercel Cron)
- [ ] Accessibility audit (axe-core, keyboard testing, screen reader testing)
- [ ] Performance audit (Lighthouse CI, Core Web Vitals verification)
- [ ] Final seed data for demo
- [ ] Launch

---

## Post-Launch Roadmap

- [ ] Mentor matching (opt-in mentors, request mentorship)
- [ ] Project ideas board (propose ideas, upvote)
- [ ] Slack/Discord integration (event reminders, badge awards via webhooks)
- [ ] Kubeflow Wrapped (year-end animated summary, shareable)
- [ ] Talk recordings library (link recordings to CFP submissions)
- [ ] Internationalization (Hindi + English via next-intl)
- [ ] Mobile app (React Native / Expo, push notifications)
