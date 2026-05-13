import { z } from "zod";

export const createNewsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().max(500).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).max(10).optional(),
  status: z.enum(["draft", "published", "archived"]),
});

export const updateNewsSchema = createNewsSchema;

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
