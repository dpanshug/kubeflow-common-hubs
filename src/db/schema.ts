import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "member",
  "moderator",
  "admin",
  "superadmin",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "meetup",
  "conference",
  "workshop",
  "hackathon",
  "webinar",
]);

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "upcoming",
  "live",
  "completed",
  "cancelled",
]);

export const cfpStatusEnum = pgEnum("cfp_status", [
  "draft",
  "open",
  "closed",
  "reviewing",
  "finalized",
]);

export const cfpSubmissionStatusEnum = pgEnum("cfp_submission_status", [
  "submitted",
  "in_review",
  "shortlisted",
  "approved",
  "rejected",
  "waitlisted",
]);

export const talkTypeEnum = pgEnum("talk_type", [
  "talk_30",
  "talk_45",
  "lightning_10",
  "workshop",
  "panel",
]);

export const badgeCategoryEnum = pgEnum("badge_category", [
  "contribution",
  "community",
  "engagement",
  "special",
]);

export const badgeTierEnum = pgEnum("badge_tier", [
  "bronze",
  "silver",
  "gold",
  "platinum",
]);

export const rsvpStatusEnum = pgEnum("rsvp_status", [
  "going",
  "maybe",
  "not_going",
]);

export const newsStatusEnum = pgEnum("news_status", [
  "draft",
  "published",
  "archived",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "badge_earned",
  "cfp_status_changed",
  "event_reminder",
  "level_up",
  "welcome",
  "general",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "profile_completed",
  "event_attended",
  "cfp_submitted",
  "cfp_approved",
  "badge_earned",
  "level_up",
  "pr_merged",
  "issue_filed",
  "review_done",
  "news_published",
]);

// ─── USERS ──────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").default("member").notNull(),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── PROFILES ───────────────────────────────────────────
export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  title: text("title"),
  company: text("company"),
  location: text("location"),
  githubUsername: text("github_username").unique(),
  linkedinUrl: text("linkedin_url"),
  twitterHandle: text("twitter_handle"),
  website: text("website"),
  bio: text("bio"),
  skills: text("skills").array(),
  interests: text("interests").array(),
  points: integer("points").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  contributionCalendar: jsonb("contribution_calendar").$type<Record<string, number>>(),
  emailPreferences: jsonb("email_preferences")
    .$type<{
      badgeEarned: boolean;
      cfpStatusChange: boolean;
      eventReminders: boolean;
      weeklyDigest: boolean;
    }>()
    .default({
      badgeEarned: true,
      cfpStatusChange: true,
      eventReminders: true,
      weeklyDigest: true,
    })
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── EVENTS ─────────────────────────────────────────────
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description").notNull(),
    shortDescription: text("short_description"),
    location: text("location"),
    city: text("city"),
    eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
    eventEndDate: timestamp("event_end_date", { withTimezone: true }),
    type: eventTypeEnum("type").notNull(),
    status: eventStatusEnum("status").default("draft").notNull(),
    bannerUrl: text("banner_url"),
    rsvpUrl: text("rsvp_url"),
    maxAttendees: integer("max_attendees"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("events_date_status_idx").on(table.eventDate, table.status),
    index("events_city_idx").on(table.city),
  ]
);

// ─── EVENT ATTENDEES ────────────────────────────────────
export const eventAttendees = pgTable(
  "event_attendees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .references(() => events.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    rsvpStatus: rsvpStatusEnum("rsvp_status").default("going").notNull(),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("event_attendees_unique_idx").on(table.eventId, table.userId),
  ]
);

// ─── CFPS ───────────────────────────────────────────────
export const cfps = pgTable("cfps", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").references(() => events.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  guidelines: text("guidelines"),
  deadline: timestamp("deadline", { withTimezone: true }).notNull(),
  topics: text("topics").array(),
  acceptedFormats: text("accepted_formats").array(),
  status: cfpStatusEnum("status").default("draft").notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── CFP SUBMISSIONS ────────────────────────────────────
export const cfpSubmissions = pgTable(
  "cfp_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cfpId: uuid("cfp_id")
      .references(() => cfps.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    guestName: text("guest_name"),
    guestEmail: text("guest_email"),
    title: text("title").notNull(),
    abstract: text("abstract").notNull(),
    outline: text("outline"),
    speakerBio: text("speaker_bio"),
    talkType: talkTypeEnum("talk_type").notNull(),
    status: cfpSubmissionStatusEnum("status").default("submitted").notNull(),
    avgRating: integer("avg_rating"),
    adminFeedback: text("admin_feedback"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("cfp_submissions_cfp_status_idx").on(table.cfpId, table.status),
  ]
);

// ─── CFP REVIEWS ────────────────────────────────────────
export const cfpReviews = pgTable(
  "cfp_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .references(() => cfpSubmissions.id, { onDelete: "cascade" })
      .notNull(),
    reviewerId: uuid("reviewer_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull(),
    feedback: text("feedback"),
    internalNotes: text("internal_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("cfp_reviews_unique_idx").on(table.submissionId, table.reviewerId),
  ]
);

// ─── BADGES ─────────────────────────────────────────────
export const badges = pgTable("badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  criteriaDescription: text("criteria_description"),
  criteriaRules: jsonb("criteria_rules"),
  category: badgeCategoryEnum("category").notNull(),
  tier: badgeTierEnum("tier").notNull(),
  isAuto: boolean("is_auto").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  pointsValue: integer("points_value").default(10).notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── USER BADGES ────────────────────────────────────────
export const userBadges = pgTable(
  "user_badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    badgeId: uuid("badge_id")
      .references(() => badges.id, { onDelete: "cascade" })
      .notNull(),
    awardedAt: timestamp("awarded_at", { withTimezone: true }).defaultNow().notNull(),
    awardedBy: uuid("awarded_by").references(() => users.id),
    reason: text("reason"),
    evidence: jsonb("evidence"),
  },
  (table) => [
    uniqueIndex("user_badges_unique_idx").on(table.userId, table.badgeId),
  ]
);

// ─── GITHUB CONTRIBUTIONS ───────────────────────────────
export const githubContributions = pgTable(
  "github_contributions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    repoFullName: text("repo_full_name").notNull(),
    prsMerged: integer("prs_merged").default(0).notNull(),
    prsOpened: integer("prs_opened").default(0).notNull(),
    issuesOpened: integer("issues_opened").default(0).notNull(),
    reviewsDone: integer("reviews_done").default(0).notNull(),
    commits: integer("commits").default(0).notNull(),
    lastSynced: timestamp("last_synced", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("github_contributions_user_idx").on(table.userId)]
);

// ─── NEWS POSTS ─────────────────────────────────────────
export const newsPosts = pgTable("news_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImageUrl: text("cover_image_url"),
  tags: text("tags").array(),
  status: newsStatusEnum("status").default("draft").notNull(),
  authorId: uuid("author_id").references(() => users.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── ACTIVITY LOG ───────────────────────────────────────
export const activityLog = pgTable(
  "activity_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    actionType: activityTypeEnum("action_type").notNull(),
    description: text("description").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("activity_log_user_date_idx").on(table.userId, table.createdAt),
  ]
);

// ─── AUDIT LOG ──────────────────────────────────────────
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── NOTIFICATIONS ──────────────────────────────────────
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    link: text("link"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_read_idx").on(
      table.userId,
      table.isRead,
      table.createdAt
    ),
  ]
);
