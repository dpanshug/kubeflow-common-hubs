import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export type UserRole = "member" | "moderator" | "admin" | "superadmin";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  member: 0,
  moderator: 1,
  admin: 2,
  superadmin: 3,
};

export class AuthError extends Error {
  constructor(
    message: string,
    public code: "UNAUTHENTICATED" | "FORBIDDEN" | "SUSPENDED"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError("Authentication required", "UNAUTHENTICATED");
  }

  return user;
}

export async function requireRole(minRole: UserRole) {
  const user = await requireAuth();

  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(and(eq(users.id, user.id), isNull(users.deletedAt)))
    .limit(1);

  if (!dbUser) {
    throw new AuthError("User not found", "UNAUTHENTICATED");
  }

  if (dbUser.role && ROLE_HIERARCHY[dbUser.role] < ROLE_HIERARCHY[minRole]) {
    throw new AuthError(
      `Requires ${minRole} role or higher`,
      "FORBIDDEN"
    );
  }

  return user;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const result = await db
    .select()
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(and(eq(users.id, user.id), isNull(users.deletedAt)))
    .limit(1);

  if (!result[0]) return null;

  return {
    authUser: user,
    user: result[0].users,
    profile: result[0].profiles,
  };
}

export async function requireAuthOrRedirect(redirectTo = "/login") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}
