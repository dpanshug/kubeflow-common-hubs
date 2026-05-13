import { z } from "zod";

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  title: z
    .string()
    .max(100, "Title must be less than 100 characters")
    .optional(),
  company: z
    .string()
    .max(100, "Company must be less than 100 characters")
    .optional(),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
  githubUsername: z
    .string()
    .regex(
      /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
      "Invalid GitHub username format"
    )
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  twitterHandle: z
    .string()
    .regex(/^@?[a-zA-Z0-9_]{1,15}$/, "Invalid Twitter handle")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  skills: z
    .array(z.string().max(50))
    .max(20, "Maximum 20 skills")
    .default([]),
  interests: z
    .array(z.string())
    .max(10, "Maximum 10 interests")
    .default([]),
});

export const onboardingStep1Schema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .transform((v) => v.trim()),
  title: z.string().max(100).optional().transform((v) => v?.trim() || undefined),
  company: z.string().max(100).optional().transform((v) => v?.trim() || undefined),
  location: z.string().max(100).optional().transform((v) => v?.trim() || undefined),
});

export const onboardingStep2Schema = z.object({
  githubUsername: z
    .string()
    .regex(
      /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
      "Invalid GitHub username format"
    )
    .optional()
    .or(z.literal("")),
});

export const onboardingStep3Schema = z.object({
  interests: z.array(z.string()).min(0).max(10),
  bio: z.string().max(500).optional().transform((v) => v?.trim() || undefined),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3Input = z.infer<typeof onboardingStep3Schema>;
