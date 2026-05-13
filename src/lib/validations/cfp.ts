import { z } from "zod";

export const cfpSubmissionStep1Schema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters")
    .transform((v) => v.trim()),
  abstract: z
    .string()
    .min(50, "Abstract must be at least 50 characters")
    .max(2000, "Abstract must be less than 2000 characters")
    .transform((v) => v.trim()),
  talkType: z.enum(["talk_30", "talk_45", "lightning_10", "workshop", "panel"], {
    message: "Please select a talk type",
  }),
});

export const cfpSubmissionStep2Schema = z.object({
  outline: z
    .string()
    .max(5000, "Outline must be less than 5000 characters")
    .optional()
    .transform((v) => v?.trim() || undefined),
  speakerBio: z
    .string()
    .min(20, "Speaker bio must be at least 20 characters")
    .max(1000, "Speaker bio must be less than 1000 characters")
    .transform((v) => v.trim()),
});

export const cfpSubmissionFullSchema = cfpSubmissionStep1Schema.merge(
  cfpSubmissionStep2Schema
);

export const cfpReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  feedback: z
    .string()
    .max(2000, "Feedback must be less than 2000 characters")
    .optional()
    .transform((v) => v?.trim() || undefined),
  internalNotes: z
    .string()
    .max(2000, "Notes must be less than 2000 characters")
    .optional()
    .transform((v) => v?.trim() || undefined),
});

const VALID_TRANSITIONS: Record<string, string[]> = {
  submitted: ["in_review"],
  in_review: ["shortlisted", "rejected"],
  shortlisted: ["approved", "rejected", "waitlisted"],
  waitlisted: ["approved", "rejected"],
};

export function getValidTransitions(currentStatus: string): string[] {
  return VALID_TRANSITIONS[currentStatus] ?? [];
}

export function isValidTransition(from: string, to: string): boolean {
  return getValidTransitions(from).includes(to);
}

export const cfpStatusChangeSchema = z.object({
  status: z.enum([
    "submitted",
    "in_review",
    "shortlisted",
    "approved",
    "rejected",
    "waitlisted",
  ]),
  adminFeedback: z
    .string()
    .max(2000)
    .optional()
    .transform((v) => v?.trim() || undefined),
});

export type CfpSubmissionStep1Input = z.infer<typeof cfpSubmissionStep1Schema>;
export type CfpSubmissionStep2Input = z.infer<typeof cfpSubmissionStep2Schema>;
export type CfpSubmissionFullInput = z.infer<typeof cfpSubmissionFullSchema>;
export type CfpReviewInput = z.infer<typeof cfpReviewSchema>;
export type CfpStatusChangeInput = z.infer<typeof cfpStatusChangeSchema>;
