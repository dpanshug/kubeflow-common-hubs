import { z } from "zod";

export const createCfpSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  guidelines: z.string().max(5000).optional(),
  deadline: z.string().min(1, "Deadline is required"),
  topics: z.array(z.string()).max(20).optional(),
  acceptedFormats: z.array(z.string()).max(10).optional(),
  status: z.enum(["draft", "open", "closed", "reviewing", "finalized"]),
  eventId: z.string().uuid().optional().or(z.literal("")),
});

export const updateCfpSchema = createCfpSchema;

export type CreateCfpInput = z.infer<typeof createCfpSchema>;
