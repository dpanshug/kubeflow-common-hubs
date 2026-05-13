import { z } from "zod";

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["member", "moderator", "admin", "superadmin"]),
});

export const suspendUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(1, "Reason is required").max(500),
});
