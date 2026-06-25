import { auth } from "@/auth";
import { prisma } from "@/db/client";
import { adminIds } from "@/config/env";

/**
 * Auth helpers (server-side).
 * Uses Auth.js v5 for session management.
 */

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  return await prisma.user.findUnique({
    where: { id: session.user.id },
  });
}

export async function isAdmin(): Promise<boolean> {
  // In development, bypass for ease of testing
  if (process.env.NODE_ENV !== "production" || process.env.ADMIN_OPEN === "true") {
    return true;
  }

  try {
    const session = await getSession();
    if (!session?.user?.id) return false;

    // Check if user ID is in ADMIN_USER_IDS env var
    const adminList = adminIds();
    if (adminList.includes(session.user.id)) {
      return true;
    }

    // Check database for ADMIN role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    return user?.role === "ADMIN";
  } catch (err) {
    console.error("[auth/isAdmin] failed to check admin status:", err);
    return false;
  }
}

export async function requireAdmin(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) throw new Error("FORBIDDEN");

  return session.user.id;
}

export async function syncCurrentUser() {
  // Session already synced by Auth.js adapter
  return null;
}
