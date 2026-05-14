"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function getCurrentUserRole(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [row] = await db
    .select({ role: users.role })
    .from(users)
    .where(and(eq(users.id, user.id), isNull(users.deletedAt)))
    .limit(1);

  return row?.role ?? null;
}
