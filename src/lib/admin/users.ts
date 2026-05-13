"use server";

import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { eq, and, isNull, desc, ilike, or, count } from "drizzle-orm";
import { requireRole, type UserRole } from "@/lib/auth/guards";
import { logAudit } from "./audit-helper";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ROLE_LEVEL: Record<string, number> = {
  member: 0,
  moderator: 1,
  admin: 2,
  superadmin: 3,
};

const uuidSchema = z.string().uuid();

interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
}

export async function listUsers({
  page = 1,
  pageSize = 25,
  search,
  role,
}: ListUsersParams = {}) {
  await requireRole("admin");

  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.min(50, Math.max(1, Math.floor(pageSize)));
  const safeSearch = search?.slice(0, 200);

  const conditions = [isNull(users.deletedAt)];

  if (role && ["member", "moderator", "admin", "superadmin"].includes(role)) {
    conditions.push(eq(users.role, role as UserRole));
  }

  if (safeSearch) {
    conditions.push(
      or(
        ilike(users.name, `%${safeSearch}%`),
        ilike(users.email, `%${safeSearch}%`)
      )!
    );
  }

  const where = and(...conditions);

  const [rows, [total]] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        role: users.role,
        isSuspended: users.isSuspended,
        createdAt: users.createdAt,
        points: profiles.points,
        level: profiles.level,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(safePageSize)
      .offset((safePage - 1) * safePageSize),
    db.select({ value: count() }).from(users).where(where),
  ]);

  return { rows, totalCount: total?.value ?? 0 };
}

export async function getUserById(id: string) {
  await requireRole("admin");

  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return null;

  const result = await db
    .select()
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(users.id, parsed.data), isNull(users.deletedAt)))
    .limit(1);

  if (!result[0]) return null;

  return { user: result[0].users, profile: result[0].profiles };
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const actor = await requireRole("admin");

  const parsedId = uuidSchema.safeParse(userId);
  if (!parsedId.success) return { error: "Invalid user ID" };

  if (!["member", "moderator", "admin", "superadmin"].includes(newRole)) {
    return { error: "Invalid role" };
  }

  if (actor.id === parsedId.data) {
    return { error: "Cannot change your own role" };
  }

  const result = await db.transaction(async (tx) => {
    const [target] = await tx
      .select({ role: users.role })
      .from(users)
      .where(and(eq(users.id, parsedId.data), isNull(users.deletedAt)))
      .limit(1);

    if (!target) return { error: "User not found" };

    const [actorRow] = await tx
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, actor.id))
      .limit(1);

    const actorLevel = ROLE_LEVEL[actorRow?.role ?? "member"];
    const targetLevel = ROLE_LEVEL[target.role];
    const newLevel = ROLE_LEVEL[newRole];

    if (actorRow?.role !== "superadmin") {
      if (targetLevel >= actorLevel) {
        return { error: "Cannot modify a user with equal or higher role" };
      }
      if (newLevel >= actorLevel) {
        return { error: "Cannot assign a role equal to or above your own" };
      }
    }

    await tx
      .update(users)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(users.id, parsedId.data));

    return { success: true, oldRole: target.role };
  });

  if ("error" in result) return result;

  await logAudit({
    actorId: actor.id,
    action: "user.role_changed",
    targetType: "user",
    targetId: parsedId.data,
    oldValues: { role: result.oldRole },
    newValues: { role: newRole },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${parsedId.data}`);
  return { success: true };
}

export async function suspendUser(userId: string) {
  const actor = await requireRole("admin");

  const parsedId = uuidSchema.safeParse(userId);
  if (!parsedId.success) return { error: "Invalid user ID" };

  if (actor.id === parsedId.data) {
    return { error: "Cannot suspend yourself" };
  }

  const [actorRow] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, actor.id))
    .limit(1);

  const [target] = await db
    .select({ role: users.role })
    .from(users)
    .where(and(eq(users.id, parsedId.data), isNull(users.deletedAt)))
    .limit(1);

  if (!target) return { error: "User not found" };

  const actorLevel = ROLE_LEVEL[actorRow?.role ?? "member"];
  const targetLevel = ROLE_LEVEL[target.role];

  if (actorRow?.role !== "superadmin" && targetLevel >= actorLevel) {
    return { error: "Cannot suspend a user with equal or higher role" };
  }

  await db
    .update(users)
    .set({ isSuspended: true, updatedAt: new Date() })
    .where(eq(users.id, parsedId.data));

  await logAudit({
    actorId: actor.id,
    action: "user.suspended",
    targetType: "user",
    targetId: parsedId.data,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${parsedId.data}`);
  return { success: true };
}

export async function unsuspendUser(userId: string) {
  const actor = await requireRole("admin");

  const parsedId = uuidSchema.safeParse(userId);
  if (!parsedId.success) return { error: "Invalid user ID" };

  const [actorRow] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, actor.id))
    .limit(1);

  const [target] = await db
    .select({ role: users.role })
    .from(users)
    .where(and(eq(users.id, parsedId.data), isNull(users.deletedAt)))
    .limit(1);

  if (!target) return { error: "User not found" };

  const actorLevel = ROLE_LEVEL[actorRow?.role ?? "member"];
  const targetLevel = ROLE_LEVEL[target.role];

  if (actorRow?.role !== "superadmin" && targetLevel >= actorLevel) {
    return { error: "Cannot unsuspend a user with equal or higher role" };
  }

  await db
    .update(users)
    .set({ isSuspended: false, updatedAt: new Date() })
    .where(eq(users.id, parsedId.data));

  await logAudit({
    actorId: actor.id,
    action: "user.unsuspended",
    targetType: "user",
    targetId: parsedId.data,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${parsedId.data}`);
  return { success: true };
}
