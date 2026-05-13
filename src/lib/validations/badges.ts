import { z } from "zod";

export const createBadgeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().min(5, "Description must be at least 5 characters").max(500),
  imageUrl: z.string().url().optional().or(z.literal("")),
  criteriaDescription: z.string().max(1000).optional(),
  category: z.enum(["contribution", "community", "engagement", "special"]),
  tier: z.enum(["bronze", "silver", "gold", "platinum"]),
  isAuto: z.boolean(),
  pointsValue: z.number().int().min(0).max(1000),
});

export const updateBadgeSchema = createBadgeSchema.partial().required({ name: true });

export const awardBadgeSchema = z.object({
  badgeId: z.string().uuid(),
  userId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
