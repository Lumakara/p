/**
 * Auth helpers built on Auth.js (NextAuth v5).
 */
import { auth } from "@/auth";

/** Returns the current user id, or null if not signed in. */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Returns the full session user, or null. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Determine whether the current session belongs to an admin. */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

/** Throws if the current user is not an admin. Returns the admin user id. */
export async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  if (session.user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session.user.id;
}
