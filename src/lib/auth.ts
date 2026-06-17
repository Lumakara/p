import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { cookies } from "next/headers";

import { adminAuth } from "@/lib/firebase-admin";

/** 
 * Auth helpers (server-side).
 * Replaced Clerk with a simple guest cookie mechanism and Firebase Token verification.
 */

export function adminIds(): string[] {
  return (process.env.NEXT_ADMIN_USER_IDS || process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sid = cookieStore.get("guest_id")?.value;
  if (!sid) {
    sid = "guest_" + Math.random().toString(36).substring(2, 15);
  }
  return sid;
}

export async function isAdmin(): Promise<boolean> {
  // In development, or if ADMIN_OPEN is explicitly "true", bypass authentication check for ease of testing.
  if (process.env.NODE_ENV !== "production" || process.env.ADMIN_OPEN === "true") {
    return true;
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("firebase_token")?.value;
    if (!token) return false;

    // Verify token using Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 1. Check if UID is explicitly in ADMIN_USER_IDS environment variable
    if (adminIds().includes(uid)) {
      return true;
    }

    // 2. Check if database user is configured as an ADMIN
    const dbUser = await prisma.user.findUnique({
      where: { id: uid },
      select: { role: true },
    });
    if (dbUser && dbUser.role === "ADMIN") {
      return true;
    }

    return false;
  } catch (err) {
    console.error("[auth/isAdmin] failed to check admin status:", err);
    return false;
  }
}

export async function requireAdmin(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("firebase_token")?.value;
    if (token) {
      const decodedToken = await adminAuth.verifyIdToken(token);
      const uid = decodedToken.uid;
      
      const isUserAdmin = adminIds().includes(uid) || 
        (await prisma.user.findUnique({ where: { id: uid }, select: { role: true } }))?.role === "ADMIN";
      
      if (isUserAdmin || process.env.NODE_ENV !== "production" || process.env.ADMIN_OPEN === "true") {
        return uid;
      }
    }
  } catch (err) {
    console.error("[auth/requireAdmin] error verifying admin token:", err);
  }

  // Fallback for dev/ADMIN_OPEN if token is missing
  if (process.env.NODE_ENV !== "production" || process.env.ADMIN_OPEN === "true") {
    return "admin_dev";
  }

  throw new Error("FORBIDDEN");
}

export async function syncCurrentUser() {
  // Removed Clerk implementation.
  return null;
}
