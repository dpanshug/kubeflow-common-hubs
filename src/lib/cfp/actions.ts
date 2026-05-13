"use server";

import { eq, and, asc, desc, count, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";

import {
  cfps,
  cfpSubmissions,
  cfpReviews,
  users,
  notifications,
  activityLog,
} from "@/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/guards";
import {
  cfpSubmissionFullSchema,
  cfpReviewSchema,
  isValidTransition,
  getValidTransitions,
} from "@/lib/validations/cfp";
import { isDeadlinePassed, isValidUuid } from "@/lib/cfp/utils";

type ActionResult = {
  error?: string;
  success?: boolean;
  data?: unknown;
};

// ─── SPEAKER ACTIONS ────────────────────────────────────

export async function submitCfpProposal(
  cfpId: string,
  formData: FormData
): Promise<ActionResult> {
  if (!isValidUuid(cfpId)) {
    return { error: "Invalid CFP ID" };
  }

  const user = await requireAuth();

  const cfp = await db
    .select()
    .from(cfps)
    .where(eq(cfps.id, cfpId))
    .limit(1);

  if (!cfp[0]) {
    return { error: "CFP not found" };
  }

  if (cfp[0].status !== "open") {
    return { error: "This CFP is no longer accepting submissions" };
  }

  if (isDeadlinePassed(cfp[0].deadline)) {
    return { error: "The submission deadline has passed" };
  }

  const existing = await db
    .select({ id: cfpSubmissions.id })
    .from(cfpSubmissions)
    .where(
      and(
        eq(cfpSubmissions.cfpId, cfpId),
        eq(cfpSubmissions.userId, user.id)
      )
    )
    .limit(1);

  if (existing[0]) {
    return { error: "You have already submitted a proposal to this CFP" };
  }

  const raw = {
    title: formData.get("title") as string,
    abstract: formData.get("abstract") as string,
    talkType: formData.get("talkType") as string,
    outline: formData.get("outline") as string,
    speakerBio: formData.get("speakerBio") as string,
  };

  const parsed = cfpSubmissionFullSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (
    cfp[0].acceptedFormats &&
    cfp[0].acceptedFormats.length > 0 &&
    !cfp[0].acceptedFormats.includes(parsed.data.talkType)
  ) {
    return { error: "Selected talk type is not accepted for this CFP" };
  }

  const [submission] = await db
    .insert(cfpSubmissions)
    .values({
      cfpId,
      userId: user.id,
      title: parsed.data.title,
      abstract: parsed.data.abstract,
      talkType: parsed.data.talkType as "talk_30" | "talk_45" | "lightning_10" | "workshop" | "panel",
      outline: parsed.data.outline || null,
      speakerBio: parsed.data.speakerBio,
    })
    .returning({ id: cfpSubmissions.id });

  await db.insert(activityLog).values({
    userId: user.id,
    actionType: "cfp_submitted",
    description: `Submitted proposal "${parsed.data.title}" to ${cfp[0].title}`,
    metadata: { cfpId, submissionId: submission.id },
  });

  await db.insert(notifications).values({
    userId: user.id,
    type: "cfp_status_changed",
    title: "Proposal Submitted",
    message: `Your proposal "${parsed.data.title}" has been submitted to ${cfp[0].title}.`,
    link: `/submissions/${submission.id}`,
  });

  revalidatePath("/submissions");
  revalidatePath(`/cfps/${cfpId}`);

  return { success: true, data: { submissionId: submission.id } };
}

export async function getMySubmissions(page = 1, limit = 20) {
  const user = await requireAuth();
  const offset = (page - 1) * limit;

  const items = await db
    .select({
      id: cfpSubmissions.id,
      title: cfpSubmissions.title,
      status: cfpSubmissions.status,
      talkType: cfpSubmissions.talkType,
      avgRating: cfpSubmissions.avgRating,
      createdAt: cfpSubmissions.createdAt,
      cfpTitle: cfps.title,
      cfpId: cfps.id,
      cfpStatus: cfps.status,
    })
    .from(cfpSubmissions)
    .innerJoin(cfps, eq(cfpSubmissions.cfpId, cfps.id))
    .where(eq(cfpSubmissions.userId, user.id))
    .orderBy(desc(cfpSubmissions.createdAt))
    .limit(limit)
    .offset(offset);

  const [total] = await db
    .select({ count: count() })
    .from(cfpSubmissions)
    .where(eq(cfpSubmissions.userId, user.id));

  return {
    items,
    total: total?.count ?? 0,
    page,
    totalPages: Math.ceil((total?.count ?? 0) / limit),
  };
}

export async function getSubmissionDetail(submissionId: string) {
  if (!isValidUuid(submissionId)) return null;
  const user = await requireAuth();

  const [submission] = await db
    .select({
      id: cfpSubmissions.id,
      title: cfpSubmissions.title,
      abstract: cfpSubmissions.abstract,
      outline: cfpSubmissions.outline,
      speakerBio: cfpSubmissions.speakerBio,
      talkType: cfpSubmissions.talkType,
      status: cfpSubmissions.status,
      avgRating: cfpSubmissions.avgRating,
      adminFeedback: cfpSubmissions.adminFeedback,
      createdAt: cfpSubmissions.createdAt,
      updatedAt: cfpSubmissions.updatedAt,
      userId: cfpSubmissions.userId,
      cfpId: cfpSubmissions.cfpId,
      cfpTitle: cfps.title,
      cfpStatus: cfps.status,
    })
    .from(cfpSubmissions)
    .innerJoin(cfps, eq(cfpSubmissions.cfpId, cfps.id))
    .where(eq(cfpSubmissions.id, submissionId))
    .limit(1);

  if (!submission) return null;

  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const isAdmin =
    dbUser?.role === "admin" ||
    dbUser?.role === "superadmin" ||
    dbUser?.role === "moderator";

  if (submission.userId !== user.id && !isAdmin) {
    return null;
  }

  return submission;
}

export async function getUserSubmissionForCfp(cfpId: string) {
  if (!isValidUuid(cfpId)) return null;
  const user = await requireAuth();

  const [submission] = await db
    .select({ id: cfpSubmissions.id })
    .from(cfpSubmissions)
    .where(
      and(
        eq(cfpSubmissions.cfpId, cfpId),
        eq(cfpSubmissions.userId, user.id)
      )
    )
    .limit(1);

  return submission ?? null;
}

// ─── ADMIN ACTIONS ──────────────────────────────────────

export async function updateSubmissionStatus(
  submissionId: string,
  newStatus: string,
  adminFeedback?: string
): Promise<ActionResult> {
  if (!isValidUuid(submissionId)) {
    return { error: "Invalid submission ID" };
  }

  await requireRole("moderator");

  const [submission] = await db
    .select({
      id: cfpSubmissions.id,
      status: cfpSubmissions.status,
      title: cfpSubmissions.title,
      userId: cfpSubmissions.userId,
      cfpTitle: cfps.title,
    })
    .from(cfpSubmissions)
    .innerJoin(cfps, eq(cfpSubmissions.cfpId, cfps.id))
    .where(eq(cfpSubmissions.id, submissionId))
    .limit(1);

  if (!submission) {
    return { error: "Submission not found" };
  }

  if (!isValidTransition(submission.status, newStatus)) {
    const valid = getValidTransitions(submission.status);
    return {
      error: `Cannot move from "${submission.status}" to "${newStatus}". Valid transitions: ${valid.join(", ") || "none"}`,
    };
  }

  type SubmissionStatusValue = "submitted" | "in_review" | "shortlisted" | "approved" | "rejected" | "waitlisted";

  await db
    .update(cfpSubmissions)
    .set({
      status: newStatus as SubmissionStatusValue,
      adminFeedback: adminFeedback || null,
      updatedAt: new Date(),
    })
    .where(eq(cfpSubmissions.id, submissionId));

  const statusLabels: Record<string, string> = {
    in_review: "is now under review",
    shortlisted: "has been shortlisted",
    approved: "has been approved",
    rejected: "was not selected",
    waitlisted: "has been waitlisted",
  };

  await db.insert(notifications).values({
    userId: submission.userId,
    type: "cfp_status_changed",
    title: `Proposal ${newStatus === "approved" ? "Approved!" : "Updated"}`,
    message: `Your proposal "${submission.title}" for ${submission.cfpTitle} ${statusLabels[newStatus] || "status changed"}.`,
    link: `/submissions/${submissionId}`,
  });

  if (newStatus === "approved") {
    await db.insert(activityLog).values({
      userId: submission.userId,
      actionType: "cfp_approved",
      description: `Talk "${submission.title}" approved for ${submission.cfpTitle}`,
      metadata: { submissionId },
    });
  }

  revalidatePath("/submissions");
  revalidatePath("/admin/cfps");

  return { success: true };
}

export async function submitReview(
  submissionId: string,
  formData: FormData
): Promise<ActionResult> {
  if (!isValidUuid(submissionId)) {
    return { error: "Invalid submission ID" };
  }

  const user = await requireRole("moderator");

  const [submission] = await db
    .select({ userId: cfpSubmissions.userId })
    .from(cfpSubmissions)
    .where(eq(cfpSubmissions.id, submissionId))
    .limit(1);

  if (!submission) {
    return { error: "Submission not found" };
  }

  if (submission.userId === user.id) {
    return { error: "You cannot review your own submission" };
  }

  const raw = {
    rating: Number(formData.get("rating")),
    feedback: formData.get("feedback") as string,
    internalNotes: formData.get("internalNotes") as string,
  };

  const parsed = cfpReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await db
    .insert(cfpReviews)
    .values({
      submissionId,
      reviewerId: user.id,
      rating: parsed.data.rating,
      feedback: parsed.data.feedback || null,
      internalNotes: parsed.data.internalNotes || null,
    })
    .onConflictDoUpdate({
      target: [cfpReviews.submissionId, cfpReviews.reviewerId],
      set: {
        rating: parsed.data.rating,
        feedback: parsed.data.feedback || null,
        internalNotes: parsed.data.internalNotes || null,
      },
    });

  // Raw SQL for atomic avg — coupled to Postgres table/column names "cfp_reviews" and "submission_id"
  await db
    .update(cfpSubmissions)
    .set({
      avgRating: sql`(SELECT ROUND(AVG(rating)) FROM cfp_reviews WHERE submission_id = ${submissionId})::integer`,
      updatedAt: new Date(),
    })
    .where(eq(cfpSubmissions.id, submissionId));

  await db.insert(activityLog).values({
    userId: user.id,
    actionType: "review_done",
    description: `Reviewed submission "${submissionId}"`,
    metadata: { submissionId, rating: parsed.data.rating },
  });

  revalidatePath("/admin/cfps");
  return { success: true };
}

export async function getCfpSubmissions(
  cfpId: string,
  statusFilter?: string,
  page = 1,
  limit = 50
) {
  if (!isValidUuid(cfpId)) return { items: [], total: 0, page, totalPages: 0 };
  await requireRole("moderator");
  const offset = (page - 1) * limit;

  type SubmissionStatus = "submitted" | "in_review" | "shortlisted" | "approved" | "rejected" | "waitlisted";
  const validStatuses: SubmissionStatus[] = ["submitted", "in_review", "shortlisted", "approved", "rejected", "waitlisted"];

  const baseCondition = eq(cfpSubmissions.cfpId, cfpId);
  const hasStatusFilter = statusFilter && statusFilter !== "all" && validStatuses.includes(statusFilter as SubmissionStatus);

  const whereClause = hasStatusFilter
    ? and(baseCondition, eq(cfpSubmissions.status, statusFilter as SubmissionStatus))
    : baseCondition;

  const items = await db
    .select({
      id: cfpSubmissions.id,
      title: cfpSubmissions.title,
      abstract: cfpSubmissions.abstract,
      talkType: cfpSubmissions.talkType,
      status: cfpSubmissions.status,
      avgRating: cfpSubmissions.avgRating,
      createdAt: cfpSubmissions.createdAt,
      userId: cfpSubmissions.userId,
      speakerName: users.name,
      speakerEmail: users.email,
    })
    .from(cfpSubmissions)
    .innerJoin(users, eq(cfpSubmissions.userId, users.id))
    .where(whereClause)
    .orderBy(desc(cfpSubmissions.createdAt))
    .limit(limit)
    .offset(offset);

  const [total] = await db
    .select({ count: count() })
    .from(cfpSubmissions)
    .where(whereClause);

  return {
    items,
    total: total?.count ?? 0,
    page,
    totalPages: Math.ceil((total?.count ?? 0) / limit),
  };
}

export async function getAdminCfpList() {
  await requireRole("moderator");

  const cfpList = await db
    .select({
      id: cfps.id,
      title: cfps.title,
      description: cfps.description,
      deadline: cfps.deadline,
      status: cfps.status,
      topics: cfps.topics,
      createdAt: cfps.createdAt,
    })
    .from(cfps)
    .orderBy(desc(cfps.deadline));

  const submissionCounts = await db
    .select({
      cfpId: cfpSubmissions.cfpId,
      count: count(),
    })
    .from(cfpSubmissions)
    .groupBy(cfpSubmissions.cfpId);

  const countMap = new Map(
    submissionCounts.map((s) => [s.cfpId, s.count])
  );

  return cfpList.map((cfp) => ({
    ...cfp,
    submissionCount: countMap.get(cfp.id) ?? 0,
  }));
}

export async function getSubmissionForReview(submissionId: string) {
  if (!isValidUuid(submissionId)) return null;
  await requireRole("moderator");

  const [submission] = await db
    .select({
      id: cfpSubmissions.id,
      title: cfpSubmissions.title,
      abstract: cfpSubmissions.abstract,
      outline: cfpSubmissions.outline,
      speakerBio: cfpSubmissions.speakerBio,
      talkType: cfpSubmissions.talkType,
      status: cfpSubmissions.status,
      avgRating: cfpSubmissions.avgRating,
      adminFeedback: cfpSubmissions.adminFeedback,
      createdAt: cfpSubmissions.createdAt,
      updatedAt: cfpSubmissions.updatedAt,
      userId: cfpSubmissions.userId,
      cfpId: cfpSubmissions.cfpId,
      cfpTitle: cfps.title,
      speakerName: users.name,
      speakerEmail: users.email,
    })
    .from(cfpSubmissions)
    .innerJoin(cfps, eq(cfpSubmissions.cfpId, cfps.id))
    .innerJoin(users, eq(cfpSubmissions.userId, users.id))
    .where(eq(cfpSubmissions.id, submissionId))
    .limit(1);

  if (!submission) return null;

  const reviews = await db
    .select({
      id: cfpReviews.id,
      rating: cfpReviews.rating,
      feedback: cfpReviews.feedback,
      internalNotes: cfpReviews.internalNotes,
      createdAt: cfpReviews.createdAt,
      reviewerName: users.name,
      reviewerId: cfpReviews.reviewerId,
    })
    .from(cfpReviews)
    .innerJoin(users, eq(cfpReviews.reviewerId, users.id))
    .where(eq(cfpReviews.submissionId, submissionId))
    .orderBy(desc(cfpReviews.createdAt));

  return { submission, reviews };
}

export async function bulkUpdateStatus(
  submissionIds: string[],
  newStatus: string
): Promise<ActionResult> {
  await requireRole("moderator");

  if (submissionIds.length === 0) {
    return { error: "No submissions selected" };
  }

  if (submissionIds.some((id) => !isValidUuid(id))) {
    return { error: "Invalid submission ID" };
  }

  const submissions = await db
    .select({
      id: cfpSubmissions.id,
      status: cfpSubmissions.status,
      title: cfpSubmissions.title,
      userId: cfpSubmissions.userId,
      cfpTitle: cfps.title,
    })
    .from(cfpSubmissions)
    .innerJoin(cfps, eq(cfpSubmissions.cfpId, cfps.id))
    .where(inArray(cfpSubmissions.id, submissionIds));

  const errors: string[] = [];
  const validIds: string[] = [];

  for (const sub of submissions) {
    if (!isValidTransition(sub.status, newStatus)) {
      errors.push(
        `"${sub.title}" cannot move from ${sub.status} to ${newStatus}`
      );
    } else {
      validIds.push(sub.id);
    }
  }

  if (validIds.length === 0) {
    return { error: errors.join("; ") };
  }

  type BulkStatusValue = "submitted" | "in_review" | "shortlisted" | "approved" | "rejected" | "waitlisted";

  await db
    .update(cfpSubmissions)
    .set({
      status: newStatus as BulkStatusValue,
      updatedAt: new Date(),
    })
    .where(inArray(cfpSubmissions.id, validIds));

  const statusLabels: Record<string, string> = {
    in_review: "is now under review",
    shortlisted: "has been shortlisted",
    approved: "has been approved",
    rejected: "was not selected",
    waitlisted: "has been waitlisted",
  };

  for (const sub of submissions.filter((s) => validIds.includes(s.id))) {
    await db.insert(notifications).values({
      userId: sub.userId,
      type: "cfp_status_changed",
      title: `Proposal ${newStatus === "approved" ? "Approved!" : "Updated"}`,
      message: `Your proposal "${sub.title}" for ${sub.cfpTitle} ${statusLabels[newStatus] || "status changed"}.`,
      link: `/submissions/${sub.id}`,
    });

    if (newStatus === "approved") {
      await db.insert(activityLog).values({
        userId: sub.userId,
        actionType: "cfp_approved",
        description: `Talk "${sub.title}" approved for ${sub.cfpTitle}`,
        metadata: { submissionId: sub.id },
      });
    }
  }

  revalidatePath("/submissions");
  revalidatePath("/admin/cfps");

  if (errors.length > 0) {
    return {
      success: true,
      error: `${validIds.length} updated, ${errors.length} skipped: ${errors.join("; ")}`,
    };
  }

  return { success: true };
}

export async function getOpenCfps() {
  return db
    .select()
    .from(cfps)
    .where(eq(cfps.status, "open"))
    .orderBy(asc(cfps.deadline));
}

export async function getCfpById(id: string) {
  if (!isValidUuid(id)) return null;
  const [cfp] = await db
    .select()
    .from(cfps)
    .where(eq(cfps.id, id))
    .limit(1);
  return cfp ?? null;
}

export async function getAllCfpsAdmin() {
  await requireRole("moderator");
  return db.select().from(cfps).orderBy(desc(cfps.deadline));
}
