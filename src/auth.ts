import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig, adminEmails } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const email = (creds?.email as string)?.toLowerCase().trim();
        const password = creds?.password as string;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        if (user.status === "BLOCKED") return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  events: {
    // Persist provider + admin role for OAuth sign-ups.
    async signIn({ user, account }) {
      if (!user?.email) return;
      const isAdmin = adminEmails().includes(user.email.toLowerCase());
      await prisma.user
        .update({
          where: { email: user.email },
          data: {
            provider: account?.provider ?? undefined,
            ...(isAdmin ? { role: "ADMIN" } : {}),
          },
        })
        .catch(() => {});
    },
  },
});
