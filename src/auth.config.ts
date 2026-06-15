import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

/** Emails that should always be treated as ADMIN. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Edge-safe Auth.js config (no Prisma / bcrypt here so it can run in
 * middleware). The Credentials provider and the Prisma adapter are added in
 * `src/auth.ts`, which runs in the Node.js runtime.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    GitHub({ allowDangerousEmailAccountLinking: true }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      // Promote allow-listed emails to admin (works in both runtimes).
      if (token.email && adminEmails().includes(token.email.toLowerCase())) {
        token.role = "ADMIN";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.role = (token.role as string) ?? "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
