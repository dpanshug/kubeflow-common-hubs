import { relations } from "drizzle-orm";
import {
  users,
  profiles,
  userBadges,
  badges,
  githubContributions,
  activityLog,
  notifications,
  cfpSubmissions,
  cfps,
  cfpReviews,
  events,
  eventAttendees,
  newsPosts,
  auditLog,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  badges: many(userBadges),
  contributions: many(githubContributions),
  activityLog: many(activityLog),
  notifications: many(notifications),
  cfpSubmissions: many(cfpSubmissions),
  eventAttendances: many(eventAttendees),
  createdEvents: many(events),
  newsPosts: many(newsPosts),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const githubContributionsRelations = relations(githubContributions, ({ one }) => ({
  user: one(users, {
    fields: [githubContributions.userId],
    references: [users.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const cfpSubmissionsRelations = relations(cfpSubmissions, ({ one, many }) => ({
  user: one(users, {
    fields: [cfpSubmissions.userId],
    references: [users.id],
  }),
  cfp: one(cfps, {
    fields: [cfpSubmissions.cfpId],
    references: [cfps.id],
  }),
  reviews: many(cfpReviews),
}));

export const cfpsRelations = relations(cfps, ({ one, many }) => ({
  event: one(events, {
    fields: [cfps.eventId],
    references: [events.id],
  }),
  submissions: many(cfpSubmissions),
}));

export const cfpReviewsRelations = relations(cfpReviews, ({ one }) => ({
  submission: one(cfpSubmissions, {
    fields: [cfpReviews.submissionId],
    references: [cfpSubmissions.id],
  }),
  reviewer: one(users, {
    fields: [cfpReviews.reviewerId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  attendees: many(eventAttendees),
  cfps: many(cfps),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id],
  }),
}));

export const newsPostsRelations = relations(newsPosts, ({ one }) => ({
  author: one(users, {
    fields: [newsPosts.authorId],
    references: [users.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(users, {
    fields: [auditLog.actorId],
    references: [users.id],
  }),
}));
