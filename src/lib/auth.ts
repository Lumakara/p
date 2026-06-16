import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { cookies } from "next/headers";

/** 
 * Auth helpers (server-side).
 * Replaced Clerk with a simple guest cookie mechanism.
 */

function adminIds(): string[] {
  return (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sid = cookieStore.get("guest_id")?.value;
  if (!sid) {
    sid = "guest_" + Math.random().toString(36).substring(2, 15);
    // Note: Can't set cookies in server components easily, so this is just a fallback string
    // Real implementation should set this cookie in middleware or client.
  }
  return sid;
}

export async function isAdmin(): Promise<boolean> {
  // Simple check for now. You might want to implement a real login later.
  // For demo/setup purposes after removing Clerk, we can just return true if DEV, or rely on a secret.
  return process.env.NODE_ENV !== "production" || process.env.ADMIN_OPEN === "true";
}

export async function requireAdmin(): Promise<string> {
  if (!(await isAdmin())) throw new Error("FORBIDDEN");
  return "admin";
}

export async function syncCurrentUser() {
  // Removed Clerk implementation.
  return null;
}
