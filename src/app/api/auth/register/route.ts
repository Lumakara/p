import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { adminEmails } from "@/auth.config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/auth/register — email/password sign-up. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name || "").toString().trim();
    const email = (body.email || "").toString().toLowerCase().trim();
    const username = (body.username || "").toString().trim() || null;
    const phone = (body.phone || "").toString().trim() || null;
    const password = (body.password || "").toString();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 },
      );
    }

    const hash = await bcrypt.hash(password, 10);
    const isAdmin = adminEmails().includes(email);

    const user = await prisma.user.create({
      data: {
        name: name || username || email.split("@")[0],
        email,
        username,
        phone,
        password: hash,
        provider: "credentials",
        role: isAdmin ? "ADMIN" : "USER",
      },
    });

    return NextResponse.json({ ok: true, id: user.id });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : "Internal error";
    console.error("[auth/register]", m);
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
