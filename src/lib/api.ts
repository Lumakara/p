import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Wraps an admin handler with auth + error handling + audit logging. */
export async function withAdmin<T>(
  fn: (adminId: string) => Promise<T>,
  audit?: { action: string; target?: string },
): Promise<NextResponse> {
  try {
    const adminId = await requireAdmin();
    const result = await fn(adminId);
    if (audit) {
      prisma.adminLog
        .create({
          data: {
            adminId,
            action: audit.action,
            target: audit.target,
          },
        })
        .catch(() => {});
    }
    return NextResponse.json(result ?? { ok: true });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : "Internal error";
    if (m === "UNAUTHENTICATED")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (m === "FORBIDDEN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[admin]", m);
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
