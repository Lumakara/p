/**
 * Auth helpers built on Clerk (server-side).
 * Docs: https://clerk.com/docs/nextjs/getting-started/quickstart
 */
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

function adminIds(): string[] {
  return (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Determine whether the current session belongs to an admin. */
export async function isAdmin(): Promise<boolean> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;

  // 1) Clerk publicMetadata.role === "admin"
  const role = (sessionClaims as { metadata?: { role?: string } } | null)
    ?.metadata?.role;
  if (role === "admin") return true;

  // 2) Allow-list via env
  if (adminIds().includes(userId)) return true;

  // 3) DB role
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return dbUser?.role === "ADMIN";
}

/** Throws if the current user is not an admin. */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");
  if (!(await isAdmin())) throw new Error("FORBIDDEN");
  return userId;
}

/**
 * Sync the Clerk user into our database (upsert). Call this from server
 * components/routes after sign-in so that orders, reviews and the admin user
 * list stay in sync. Admin allow-list ids are promoted to ADMIN role.
 */
export async function syncCurrentUser() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.primaryEmailAddress?.emailAddress ?? null;
  const phone = user.primaryPhoneNumber?.phoneNumber ?? null;
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || null;
  const provider =
    user.externalAccounts?.[0]?.provider?.replace("oauth_", "") ||
    (email ? "email" : null);

  const role: Role = adminIds().includes(user.id) ? "ADMIN" : "USER";

  return prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: email ?? undefined,
      name: name ?? undefined,
      username: user.username ?? undefined,
      phone: phone ?? undefined,
      avatar: user.imageUrl ?? undefined,
      provider: provider ?? undefined,
    },
    create: {
      id: user.id,
      email,
      name,
      username: user.username,
      phone,
      avatar: user.imageUrl,
      provider,
      role,
    },
  });
}
