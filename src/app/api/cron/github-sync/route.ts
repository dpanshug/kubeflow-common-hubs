import { NextResponse } from "next/server";
import { syncBatchUsers } from "@/lib/github/sync";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await syncBatchUsers(10);

    const synced = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Synced ${synced} users, ${failed} failed`,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
